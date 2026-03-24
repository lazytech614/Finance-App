"use server"

import prisma from "@/lib/prisma"
import { auth } from "@clerk/nextjs/server"
import { revalidatePath } from "next/cache"
import { success } from "zod"

const serializeTransaction = (obj: any) => {
    const serialized = {...obj}

    if(obj.balance) {
        serialized.balance = obj.balance.toNumber()
    }

    if(obj.amount) {
        serialized.amount = obj.amount.toNumber()
    }

    return serialized
}

export async function createAccount(data: any) {
    try{
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

        const balanceFloat = parseFloat(data.balance)
        if(isNaN(balanceFloat)) {
            throw new Error("Invalid balance amount")
        }

        const existingAccounts = await prisma.account.findMany({
            where: {
                userId: user.id
            }
        })

        const shouldBeDefault = existingAccounts.length === 0 ? true : data.isDefault

        if(shouldBeDefault) {
            await prisma.account.updateMany({
                where: {
                    userId: user.id,
                    isDefault: true
                },
                data: {
                    isDefault: false
                }
            })
        }

        const account = await prisma.account.create({
            data: {
                ...data,
                balance: balanceFloat,
                isDefault: shouldBeDefault,
                userId: user.id
            }
        })

        const serializedAccount = serializeTransaction(account)

        revalidatePath("/dashboard")

        return {success:true, data: serializedAccount}
    }catch(err: any) {
        throw new Error(err.message)
    }
}

export async function fetchUserAccounts() {
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

        const accounts = await prisma.account.findMany({
            where: {
                userId: user.id
            },
            orderBy: {
                createdAt: "desc"
            },
            include: {
                _count: {
                    select: {
                        transactions: true
                    }
                }
            }
        })

        const serializedAccounts = accounts.map(serializeTransaction)

        return {success: true, data: serializedAccounts}
    }catch(err: any) {
        throw new Error(err.message)
    }
}

export async function getDashboardData() {
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

        const transactions = await prisma.transaction.findMany({
            where: {
                userId: user.id
            },
            orderBy: {
                date: "desc"
            }
        })

        return {success: true, data: transactions.map(serializeTransaction)}
    }catch(err) {
        console.error((err as Error).message)
        throw new Error((err as Error).message)
    }
}