"use server";

import aj from "@/lib/arcjet";
import prisma from "@/lib/prisma";
import { request } from "@arcjet/next";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

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