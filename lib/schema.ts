import { z } from "zod"

export const accountSchema = z.object({
    name: z.string().min(1, "Name is required"),
    type: z.enum(["SAVINGS", "CURRENT"]),
    balance: z.string().min(1, "Initial balance is required"),
    isDefault: z.boolean().default(false)
}) 

export const transactionSchema = z.object({
    type: z.enum(["EXPENSE", "INCOME"]),
    amount: z.string().min(1, "Amount is required"),
    description: z.string().optional(),
    date: z.date().refine(date => date !== null && date !== undefined, {
        message: "Date is required",
        path: ["date"],
    }),
    accountId: z.string().min(1, "Account is required"),
    category: z.string().min(1, "Category is required"),
    isRecurring: z.boolean().default(false),
    recurringInterval: z.enum(["DAILY", "WEEKLY", "MONTHLY", "YEARLY"]).optional(),
}).superRefine((data, ctx) => {
    if (data.isRecurring && !data.recurringInterval) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Recurring interval is required",
            path: ["RecuringInterval"],
        })
    }

    if (!data.isRecurring && data.recurringInterval) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Recurring interval is not required",
            path: ["RecuringInterval"],
        })
    }
})