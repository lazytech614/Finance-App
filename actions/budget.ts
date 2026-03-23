"use server"

import prisma from "@/lib/prisma"
import { auth } from "@clerk/nextjs/server"
import { revalidatePath } from "next/cache"

export async function getCurrentBudget(accountId:string) {
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

        const budget = await prisma.budget.findFirst({
            where: {
                userId: user.id
            }
        })

        const currentDate = new Date()

        const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
        const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)

        const expenses = await prisma.transaction.aggregate({
            where: {
                userId: user.id,
                type: "EXPENSE",
                date: {
                    gte: startOfMonth,
                    lte: endOfMonth
                },
                accountId
            },
            _sum: {
                amount: true
            }
        })

        return {
            success: true,
            budget: budget ? {...budget, amount: budget.amount.toNumber()} : null,
            currentExpenses: expenses._sum.amount?.toNumber() ? expenses._sum.amount : 0
        }

    }catch(err) {
        console.error(err)
        return {success: false, message: (err as Error).message}
    }
}

export async function updateBudget(amount: number) {
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

        const budget = await prisma.budget.upsert({
            where: {
                userId: user.id
            },
            create: {
                userId: user.id,
                amount: amount
            },
            update: {
                amount: amount
            }
        })

        revalidatePath("/dashboard")
        return {success: true, data: {...budget, amount: budget.amount.toNumber()}}
    }catch(err) {
        console.error(err)
        return {success: false, message: (err as Error).message}
    }
}