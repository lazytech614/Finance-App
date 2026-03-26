"use client"

import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useEffect, useState } from "react"
import { Input } from "../ui/input"
import { Button } from "../ui/button"
import { Check, Pencil, X } from "lucide-react"
import useFetch from "@/hooks/useFetch"
import { updateBudget } from "@/actions/budget"
import { toast } from "sonner"
import { Progress } from "../ui/progress"
import { formatIndianCurrency } from "@/lib/formatIndianCurrency"

type UpdateBudgetResponse = 
  | { success: true; data: { amount: number } }
  | { success: false; message: string }

export const BudgetProgress = ({intialBudget, currentExpanses}: any) => {
    const [isEditing, setIsEditing] = useState(false)
    const [newBudget, setNewBudget] = useState(
        intialBudget?.amount?.toString() || ""
    )

    const percentageUsed = intialBudget 
        ? Math.round((currentExpanses / intialBudget) * 100)
        : 0

    const {
        loading: isLoading,
        fn: updateBudgetFn,
        data: updatedBudget,
        error
    } = useFetch(updateBudget)

    const handleBudgetUpdate = async() => {
        const amount = parseFloat(newBudget)

        if(isNaN(amount) || amount <= 0) {
            toast.error("Please enter a valid amount")
            return
        }

        await updateBudgetFn(amount)
    }

    useEffect(() => {
        const typedBudget = updatedBudget as unknown as UpdateBudgetResponse | null
        if(typedBudget?.success) {
            setIsEditing(false)
            toast.success("Budget updated successfully")
        }
    }, [updatedBudget])

    useEffect(() => {
        if(error) {
            setIsEditing(false)
            toast.error((error as Error).message || "Something went wrong!")
        }
    }, [error])

    const handleCancel = () => {
        setNewBudget(intialBudget?.toString() || "")
        setIsEditing(false)
    }

  return (
    <Card>
        <CardHeader className="flex flow-row items-center justify-between space-y-0 pb-2">
            <div className="flex-1">
                <CardTitle>Monthly Budget (Default Account)</CardTitle>
                <div className="flex items-center gap-2 mt-1">
                    {isEditing ? (
                        <div className="flex items-center gap-2">
                            <Input 
                                type="number"
                                value={newBudget}
                                onChange={(e) => setNewBudget(e.target.value)}
                                className="w-32"
                                placeholder="Enter amount"
                                autoFocus
                                disabled={isLoading}
                            />
                            <Button variant={"ghost"} size={"icon"} onClick={handleBudgetUpdate} disabled={isLoading}>
                                <Check className="h-4 w-4 text-green-500" />
                            </Button>
                            <Button variant={"ghost"} size={"icon"} onClick={handleCancel} disabled={isLoading}>
                                <X className="h-4 w-4 text-red-500"/>
                            </Button>
                        </div>
                    ) : (
                        <>
                            <CardDescription>
                                {formatIndianCurrency(intialBudget) ? `₹${formatIndianCurrency(currentExpanses)} of ₹${formatIndianCurrency(intialBudget)} spent` : "No budget set"}
                            </CardDescription>
                            <Button
                                variant={"ghost"}
                                size={"icon"}
                                onClick={() => setIsEditing(true)}
                                className="h-6 w-6"
                            >
                                <Pencil className="h-3 w-3"/>
                            </Button>
                        </>
                    )}
                </div>
            </div>
        </CardHeader>
        <CardContent>
            {intialBudget && (
                <div className="space-y-2">
                    <Progress 
                        value={percentageUsed} 
                        extraStyles={`${percentageUsed >= 90 ? "bg-red-500" : percentageUsed >= 75 ? "bg-yellow-500" : "bg-green-500"}`}
                    />
                    <p className="text-xs text-muted-foreground text-right">{percentageUsed}% used</p>
                </div>
            )}
        </CardContent>
    </Card>
  )
}
