import { sendEmail } from "@/actions/send-email";
import prisma from "../prisma";
import { inngest } from "./client";
import EmailTemplate from "@/emails/template";

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