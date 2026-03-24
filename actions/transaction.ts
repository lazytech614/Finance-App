"use server";

import aj from "@/lib/arcjet";
import prisma from "@/lib/prisma";
import { request } from "@arcjet/next";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { GoogleGenAI } from "@google/genai";

const genAi = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
})

const serializeTransaction = (obj: any) => ({
    ...obj,
    amount: obj.amount.toNumber(),
})

export async function createTransaction(data:any) {
    try {
        const {userId} = await auth()
        if(!userId) {
            throw new Error("Unauthorized")
        }

        const user = await prisma.user.findUnique({
            where: {
                clerkId: userId
            }
        })
        if(!user) {
            throw new Error("User not found")
        }

        const req = await request()
        const decesion = await aj.protect(req, { 
            userId,
            requested: 1  // These many tokens will be consumed per request
         })

        if(decesion.isDenied()) {
            if(decesion.reason.isRateLimit()) {
                const {remaining, reset} = decesion.reason
                console.error({
                    code: "RATE_LIMIT_EXCEEDED",
                    details: {
                        remaining,
                        resetInSeconds: reset
                    }
                })
                throw new Error("Too many requests please try again later.")
            }

            throw new Error("Request blocked!")
        }

        const account = await prisma.account.findUnique({
            where: {
                id: data.accountId,
                userId: user.id
            }
        })
        if(!account) {
            throw new Error("Account not found")
        }
        

        const balanceChange = data.type === "EXPENSE" ? data.amount * -1 : data.amount
        const newBalance = account.balance.toNumber() + balanceChange

        const transaction = await prisma.$transaction(async (tx) => {
            const newTransaction = await tx.transaction.create({
                data: {
                    ...data,
                    userId: user.id,
                    accountId: account.id,
                    nextRecurringDate: 
                        data.isRecurring && data.recurringInterval
                        ? calculateNextRecurringDate(data.date, data.recurringInterval)
                        : null
                }
            })

            await tx.account.update({
                where: {
                    id: account.id
                },
                data: {
                    balance: newBalance
                }
            })

            return newTransaction
        })

        revalidatePath("/dashboard")
        revalidatePath(`/accounts/${transaction.accountId}`)

        return {success: true, data: serializeTransaction(transaction)}
    }catch(err) {
        throw new Error((err as Error).message)
    }
}

function calculateNextRecurringDate(startDate: Date, interval: string) {
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

export async function scanRecipt(file:any) {
    try {
        const arrayBuffer = await file.arrayBuffer()
        const base64String = Buffer.from(arrayBuffer).toString("base64")

        const prompt = `
            Analyze this receipt image and extract the following information in JSON format:
            - Total amount (just the number)
            - Date (in ISO format)
            - Description or items purchased (brief summary)
            - Merchant/store name
            - Suggested category (one of: housing,transportation,groceries,utilities,entertainment,food,shopping,healthcare,education,personal,travel,insurance,gifts,bills,other-expense )
            
            Only respond with valid JSON in this exact format:
            {
                "amount": number,
                "date": "ISO date string",
                "description": "string",
                "merchantName": "string",
                "category": "string"
            }

            If its not a recipt, return an empty object
        `

        const result = await genAi.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: [
                {
                role: "user",
                parts: [
                    { text: prompt },
                    {
                    inlineData: {
                        mimeType: file.type,
                        data: base64String,
                    },
                    },
                ],
                },
            ],
        });

        const text = result.candidates?.[0]?.content?.parts?.[0]?.text || "";
     
        const cleanedText = text.replace(/```(?:json)?\n?/g, "").trim()

        try {
            const data = JSON.parse(cleanedText)
            return {
                amount: parseFloat(data.amount),
                date: new Date(data.date),
                description: data.description,
                merchantName: data.merchantName,
                category: data.category
            }
        }catch(err) {
            console.error((err as Error).message)
            throw new Error("Invalid response format from gemini")
        }

    }catch(err) {
        console.error((err as Error).message)
        throw new Error("Failed to scan receipt")
    }
}

export async function getTransaction(id: string) {
    try {
        const {userId} = await auth()
        if(!userId) {
            throw new Error("Unauthorized")
        }

        const user = await prisma.user.findUnique({
            where: {
                clerkId: userId
            }
        })
        if(!user) {
            throw new Error("User not found")
        }

        const transaction = await prisma.transaction.findUnique({
            where: {
                id,
                userId: user.id
            }
        })
        if(!transaction) {
            throw new Error("Transaction not found")
        }

        return {success: true, data: serializeTransaction(transaction)}
    }catch(err) {
        console.error((err as Error).message)
        throw new Error((err as Error).message)
    }
}

export async function updateTransaction(id: string, data: any) {
    try {
        const {userId} = await auth()
        if(!userId) {
            throw new Error("Unauthorized")
        }

        const user = await prisma.user.findUnique({
            where: {
                clerkId: userId
            }
        })
        if(!user) {
            throw new Error("User not found")
        }

        const transaction = await prisma.transaction.findUnique({
            where: {
                id,
                userId: user.id
            },
            include: {
                account: true
            }
        })
        if(!transaction) {
            throw new Error("Transaction not found")
        }

        const oldBalanceChange = transaction.type === "EXPENSE" ? -transaction.amount.toNumber() : transaction.amount.toNumber()

        const newBalanceChange = data.type === "EXPENSE" ? -data.amount : data.amount

        const netBalanceChange = oldBalanceChange + newBalanceChange

        const updatedTransaction = await prisma.$transaction(async (tx) => {
            const updated = await tx.transaction.update({
                where: {
                    id,
                    userId: user.id
                },
                data: {
                   ...data,
                   nextRecurringDate: data.isRecurring ? calculateNextRecurringDate(data.date, data.recurringInterval) : null
                }
            })

            await tx.account.update({
                where: {
                    id: data.accountId
                },
                data: {
                    balance: {
                        increment: netBalanceChange
                    }
                }
            })

            return updated
        })

        revalidatePath("/dashboard")
        revalidatePath(`/account/${data.accountId}`)

        return {success: true, data: serializeTransaction(updatedTransaction)}
    }catch(err) {
        console.error((err as Error).message)
        throw new Error((err as Error).message)
    }
}