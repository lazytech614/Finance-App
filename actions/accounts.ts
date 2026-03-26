"use server"

import prisma from "@/lib/prisma"
import { auth } from "@clerk/nextjs/server"
import { Decimal } from "@prisma/client/runtime/client"
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

export async function updateDefaultAccount(accountId: string) {
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

        await prisma.account.updateMany({
            where: {
                userId: user.id,
                isDefault: true,
            },
            data: {
                isDefault: false
            }
        })

        const account = await prisma.account.update({
            where: {
                id: accountId,
                userId: user.id
            },
            data: {
                isDefault: true
            }
        })

        revalidatePath("/dashboard")

        return {success: true, data: serializeTransaction(account)}
    }catch (error: any) {
        return {success: false, error: error.message}
    }
}

export async function getAccountWithTransaction(accountId: string) {
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

        const account = await prisma.account.findUnique({
            where: {
                id: accountId,
                userId: user.id
            },
            include: {
                transactions: {
                    orderBy: {
                        date: "desc"
                    }
                },
                _count: {
                    select: {
                        transactions: true
                    }
                }
            }
        })

        if(!account) {
            return null
        }

        return {
            ...serializeTransaction(account),
            transactions: account.transactions.map(serializeTransaction),
            success: true
        }
    }catch (error: any) {
        return {success: false, error: error.message}
    }
}

export async function bulkDeleteTransactions(transactionIds: string[]) {
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
                id: {
                    in: transactionIds
                },
                userId: user.id
            }
        })

        const balanceChanges = transactions.reduce<Record<string, Decimal>>(
        (acc, transaction) => {
            const change =
                transaction.type === "EXPENSE"
                    ? transaction.amount
                    : -transaction.amount

                acc[transaction.accountId] =
                (acc[transaction.accountId] || new Decimal(0)).add(change)

            return acc
        },{})

        // When we wantsimultaneous api call and if one fails then all to be failed, prisma transactions
        await prisma.$transaction(async (tx) => {
            //Delete transactions
            await tx.transaction.deleteMany({
                where: {
                    id: {
                        in: transactionIds
                    },
                    userId: user.id
                }
            })

            // Update account balance
            for(const [accountId, balanceChange] of Object.entries(balanceChanges)) {
                await tx.account.update({
                    where: {
                        id: accountId
                    },
                    data: {
                        balance: {
                            increment: balanceChange
                        }
                    }
                })
            }
        })

        revalidatePath("/dashboard")
        revalidatePath("/account/[id]")

        return {success: true}
    }catch(err: any) {
        return {success: false, error: err.message}
    }
}