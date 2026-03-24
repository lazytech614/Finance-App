import { sendEmail } from "@/actions/send-email";
import prisma from "../prisma";
import { inngest } from "./client";
import EmailTemplate from "@/emails/template";
import { GoogleGenAI } from "@google/genai";

export const checkBudgetAlerts = inngest.createFunction(
    { 
        id: "check-budget-alerts",
        name: "Check Budget Alerts",
        triggers: [{ cron: "0 */6 * * *" }]
    },
    async ({ step }) => {
        const budgets = await step.run("fetch-budget", async () => {
            return await prisma.budget.findMany({
                include: {
                    user: {
                        include: {
                            accounts: {
                                where: {
                                    isDefault: true
                                }
                            }
                        }
                    }
                }
            })
        })

        for(const budget of budgets) {
            const defaultAccount = budget.user.accounts[0]
            if(!defaultAccount) {
                continue
            }

            await step.run(`check-budget-${budget.id}`, async () => {
                const startDate = new Date()
                startDate.setDate(1)

                const expenses = await prisma.transaction.aggregate({
                    where: {
                        userId: budget.user.id,
                        accountId: defaultAccount.id,
                        type: "EXPENSE",
                        date: {
                            gte: startDate
                        }
                    },
                    _sum: {
                        amount: true
                    }
                })

                const totalExpanses = expenses._sum.amount?.toNumber() || 0
                const budgetAmount = Number(budget.amount)
                const percentageUsed = (totalExpanses / budgetAmount) * 100 

                if(percentageUsed >= 80 && (!budget.lastAlertSent || isNewMonth(new Date(budget.lastAlertSent), new Date()))) {
                    // SEND EMAIL TO THE USER
                    await sendEmail({
                        to: budget.user.email,
                        subject: `Budget alert for ${defaultAccount.name}`,
                        react: EmailTemplate({
                            userName: budget.user.name ?? undefined,
                            type: "budget-alert",
                            data: {
                                percentageUsed,
                                budgetAmount,
                                totalExpenses: totalExpanses,
                                accountName: defaultAccount.name
                            }
                        }) 
                    })

                    // UPDATE THE LAST ALERT SENT DATE
                    await prisma.budget.update({
                        where: {
                            id: budget.id
                        },
                        data: {
                            lastAlertSent: new Date()
                        }
                    })
                }
            })
        }
    }
)

function isNewMonth(lastAlertDate: Date, currentDate: Date) {
    return lastAlertDate.getMonth() !== currentDate.getMonth() || lastAlertDate.getFullYear() !== currentDate.getFullYear()
}

export  const triggerRecurringTransactions = inngest.createFunction(
    { 
        id: "trigger-recurring-transactions",
        name: "Trigger Recurring Transactions",
        triggers: [{ cron: "0 0 * * *" }]
    },
    async ({ step }) => {
        // FETCHING ALL THE RECURRING TRANSACTIONS 
        const recurringTransactions = await step.run(
            "fetch-recurring-transactions",
            async () => {
                return await prisma.transaction.findMany({
                    where: {
                        isRecurring: true,
                        status: "COMPLETED",
                        OR: [
                            {lastprocessedDate: null},
                            {nextRecurringDate: {lte: new Date()}}
                        ]
                    }
                })
            }
        )


        // CREATE EVENTS FOR EACH TRANSACTIONS 
        if(recurringTransactions.length > 0) {
            const events = recurringTransactions.map((transaction) => ({
                name: "process-recurring-transaction",
                data: {
                    transactionId: transaction.id,
                    userId: transaction.userId,
                }
            }))

            // EVENTS WILL BE PROCESSED BY INNGEST 
            await inngest.send(events)
        }

        return {triggered: recurringTransactions.length}
    }
)

export const processRecurringTransaction = inngest.createFunction(
    { 
        id: "process-recurring-transaction",
        name: "Process Recurring Transaction",
        throttle: {
            limit: 10,  // Only process 10 transactions
            period: "1m",  // Per minute
            key: "event.data.userId"  // Per user
        },
        triggers: [{ event: "process-recurring-transaction" }],
    },
    async ({ event, step }) => {
        if(!event.data.transactionId || !event.data.userId) {
            console.error("Missing transactionId or userId in event data", event)
            return {error: "Missing transactionId or userId in event data"}
        }

        await step.run(
            "process-transaction",
            async () => {
                const transaction = await prisma.transaction.findUnique({
                    where: {
                        id: event.data.transactionId,
                        userId: event.data.userId
                    },
                    include: {
                        account: true
                    }
                })

                if(!transaction || !isTransactionDue(transaction)) return

                await prisma.$transaction(async (tx) => {
                    await tx.transaction.create({
                        data: {
                            type: transaction.type,
                            amount: transaction.amount,
                            // TODO: CHECK WHY THIS (RECURRING) IS NOT UPDATED
                            description: `${transaction.description} (Recurring)`,  
                            date: new Date(),
                            category: transaction.category,
                            userId: transaction.userId,
                            accountId: transaction.account.id,
                            isRecurring: false
                        }
                    })

                    const balanceChange = transaction.type === "INCOME" ? transaction.amount.toNumber() : -transaction.amount.toNumber()

                    await tx.account.update({
                        where: {
                            id: transaction.account.id
                        },
                        data: {
                            balance: {
                                increment: balanceChange
                            }
                        }
                    })

                    await tx.transaction.update({
                        where: {
                            id: transaction.id
                        },
                        data: {
                            lastprocessedDate: new Date(),
                            nextRecurringDate: getNextRecurringDate(new Date(), transaction.recurringInterval)
                        }
                    })
                })
            }
        )
    }
)

export const generateMonthlyReport = inngest.createFunction(
    { 
        id: "generate-monthly-report",
        name: "Generate Monthly Report",
        triggers: [{ cron: "0 0 1 * *" }]
    },
    async ({ step }) => {
        const users = await step.run(
            "fetch-users",
            async () => {
                return await prisma.user.findMany({
                    include: {
                        accounts: true
                    }
                })
            }
        )

        for(const user of users) {
            await step.run(
                `generate-report-${user.id}`,
                async () => {
                    const lastMonth = new Date()
                    lastMonth.setMonth(lastMonth.getMonth() - 1)

                    const stats = await getMonthlyStats(user.id, lastMonth)

                    const monthName = lastMonth.toLocaleString("default", { month: "long" })

                    console.log("🔴🔴 Stats: ", stats)

                    const insights = await generateFinancialInsights(stats, monthName) as string[] | undefined

                    await sendEmail({
                        to: user.email,
                        subject: `Your Monthly Financial Report - ${monthName}`,
                        react: EmailTemplate({
                            userName: user.name ?? undefined,
                            type: "monthly-report",
                            data: {
                                stats,
                                month: monthName,
                                insights
                            }
                        })
                        
                    })                    
                }
            )
        }

        return {processed: users.length}
    }
)

function isTransactionDue(transaction: any) {
    if(!transaction.lastprocessedDate) return true

    const today = new Date()
    const nextDue = new Date(transaction.nextRecurringDate)
    
    return nextDue <= today
}

function getNextRecurringDate(startDate: Date, interval: string | null) {
    const date = new Date(startDate)

    switch(interval) {
        case "DAILY":
            date.setDate(date.getDate() + 1)
            break
        case "WEEKLY":
            date.setDate(date.getDate() + 7)
            break
        case "MONTHLY":
            date.setMonth(date.getMonth() + 1)
            break
        case "YEARLY":
            date.setFullYear(date.getFullYear() + 1)
            break
    }

    return date
}

async function getMonthlyStats(userId: string, lastMonth: Date) {
    const startDate = new Date(lastMonth.getFullYear(), lastMonth.getMonth(), 1)
    const endDate = new Date(lastMonth.getFullYear(), lastMonth.getMonth() + 1, 0)

    const transactions = await prisma.transaction.findMany({
        where: {
            userId,
            date: {
                gte: startDate,
                lte: endDate
            }
        }
    })

    return transactions.reduce(
        (stats: any, t: any) => {
            const amount = t.amount.toNumber()
            if(t.type === "EXPENSE") {
                stats.totalExpenses += amount
                stats.byCategory[t.category] = (stats.byCategory[t.category] || 0) + amount
            }else {
                stats.totalIncome += amount
            }

            return stats
        },
        {
            totalExpenses: 0,
            totalIncome: 0,
            byCategory: {},
            transactionCount: transactions.length,
        }
    )
}

const genAi = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
})

export async function generateFinancialInsights(
    stats: any,
    monthName: string
): Promise<string[] | undefined> {
    try {
        const prompt = `
            Analyze this financial data and provide 3 concise, actionable insights.
            Focus on spending patterns and practical advice.
            Keep it friendly and conversational.

            Financial Data for ${monthName}:
            - Total Income: $${stats.totalIncome}
            - Total Expenses: $${stats.totalExpenses}
            - Net Income: $${stats.totalIncome - stats.totalExpenses}
            - Expense Categories: ${Object.entries(stats.byCategory)
            .map(([category, amount]) => `${category}: $${amount}`)
            .join(", ")}

            Format the response as a JSON array of strings, like this:
            ["insight 1", "insight 2", "insight 3"]
            `;

        const result = await genAi.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: [
                {
                    role: "user",
                    parts: [{ text: prompt }],
                },
            ],
        });

        const text =
            result.candidates?.[0]?.content?.parts?.[0]?.text || "";

        // Clean markdown if present
        const cleanedText = text
            .replace(/```(?:json)?\n?/g, "")
            .trim();

        try {
            const insights = JSON.parse(cleanedText);

            if (!Array.isArray(insights)) {
                throw new Error("Invalid format: not an array");
            }

            return insights;
        } catch (err) {
            console.error("Parsing error:", (err as Error).message);
            throw new Error("Invalid response format from Gemini");
        }
    } catch (err) {
        console.error("AI error:", (err as Error).message);
        return [
            "Your highest expense category this month might need attention.",
            "Consider setting up a budget for better financial management.",
            "Track your recurring expenses to identify potential savings.",
        ]
    }
}