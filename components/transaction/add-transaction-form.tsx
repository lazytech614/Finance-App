"use client"

import { createTransaction } from "@/actions/transaction"
import useFetch from "@/hooks/useFetch"
import { transactionSchema } from "@/lib/schema"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Label } from "../ui/label"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "../ui/input"
import { CreateAccountDrawer } from "../dashboard/create-accout-drawer"
import { Button } from "../ui/button"
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover"
import { format } from "date-fns"
import { Calendar1Icon } from "lucide-react"
import { Calendar } from "../ui/calendar"
import { Textarea } from "../ui/textarea"
import { Switch } from "../ui/switch"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { toast } from "sonner"

export const AddTransactionForm = ({accounts, categories}: any) => {

    const router = useRouter()

    const defaultAccount = Array.isArray(accounts)
        ? accounts.find((account: any) => account.isDefault)
        : undefined;

    const {
        register,
        setValue,
        handleSubmit,
        formState: { errors },
        watch,
        getValues,
        reset
    } = useForm({
        resolver: zodResolver(transactionSchema),
        defaultValues: {
            type: "EXPENSE",
            amount: "",
            description: "",
            accountId: defaultAccount?.id || "",
            date: new Date(),
            isRecurring: false,
        },
    })

    const {
        loading: transactionLoading,
        fn: transactionFn,
        data: transactionData,
        error
    } = useFetch(createTransaction)

    const type = watch("type")
    const isRecurring = watch("isRecurring")
    const date = watch("date")

    const filteredCategories = categories.filter((category: any) => category.type === type)

    const onSubmit = async (data: any) => {
        const formData = {
            ...data,
            amount: parseFloat(data.amount)
        }

        transactionFn(formData)
    }

    useEffect(() => {
        if((transactionData as any)?.success && !transactionLoading) {
            toast.success("Transaction created successfully")
            reset()
            router.push(`/account/${(transactionData as any).data.accountId}`)
        }
    }, [transactionData, transactionLoading])

  return (
    <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
        {/* TODO: AI RECIPT SCANNER  */}

        <div className="space-y-2">
            <Label className="text-sm font-medium">Type</Label>
            <Select
                onValueChange={(value: "INCOME" | "EXPENSE") => setValue("type", value)}
                defaultValue={type}
            >
                <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Type" />
                </SelectTrigger>
                <SelectContent>
                    <SelectGroup>
                    <SelectItem value="EXPENSE">Expense</SelectItem>
                    <SelectItem value="INCOME">Income</SelectItem>
                    </SelectGroup>
                </SelectContent>
            </Select>

            {errors.type && (
                <p className="text-sm text-red-500">{errors.type.message}</p>
            )}
        </div>

        <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
                <Label className="text-sm font-medium">Amount</Label>
                <Input 
                    type="number"
                    step={"0.01"}
                    placeholder="0.00"
                    {...register("amount")}
                />

                {errors.amount && (
                    <p className="text-sm text-red-500">{errors.amount.message}</p>
                )}
            </div>

            <div className="space-y-2">
                <Label className="text-sm font-medium">Account</Label>
                <Select
                    onValueChange={(accountId) => setValue("accountId", accountId)}
                    defaultValue={getValues("accountId")}
                >
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select Account" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectGroup>
                            {Array.isArray(accounts) && accounts.map((account: any) => (
                                <SelectItem key={account.id} value={account.id}>
                                    {account.name} (${parseFloat(account.balance).toFixed(2)})
                                </SelectItem>
                            ))}
                        </SelectGroup>
                        <div className="w-full flex justify-center pb-2">
                            <CreateAccountDrawer className="w-full">
                                <Button variant={"ghost"} className="w-full select-none items-center text-sm outline-none">Create Account</Button>
                            </CreateAccountDrawer>
                        </div>
                    </SelectContent>
                </Select>

                {errors.accountId && (
                    <p className="text-sm text-red-500">{errors.accountId.message}</p>
                )}
            </div>
        </div>

        <div className="space-y-2">
            <Label className="text-sm font-medium">Category</Label>
            <Select
                onValueChange={(category: any) => setValue("category", category)}
                defaultValue={getValues("category")}
            >
                <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Category" />
                </SelectTrigger>
                <SelectContent>
                    <SelectGroup>
                        {filteredCategories.map((category: any) => (
                            <SelectItem key={category.id} value={category.id}>
                                {category.name}
                            </SelectItem>
                        ))}
                    </SelectGroup>
                </SelectContent>
            </Select>

            {errors.category && (
                <p className="text-sm text-red-500">{errors.category.message}</p>
            )}
        </div>

        <div className="space-y-2">
            <Label className="text-sm font-medium">Date</Label>
            <Popover>
                <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full pl-3 text-left font-normal">
                        {date ? format(date, "PPP") : <span>Pick a date</span>}
                        <Calendar1Icon className="ml-auto h-4 w-4 opacity-50"/>
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                        mode="single"
                        selected={date}
                        onSelect={(date) => {
                            if(date) setValue("date", date)
                        }}
                        disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                        initialFocus
                    />
                </PopoverContent>
            </Popover>

            {errors.date && (
                <p className="text-sm text-red-500">{errors.date.message}</p>
            )}
        </div>

        <div className="space-y-2">
            <Label className="text-sm font-medium">Description</Label>
            <Textarea
                placeholder="Enter the description"
                {...register("description")}
            />

            {errors.description && (
                <p className="text-sm text-red-500">{errors.description.message}</p>
            )}
        </div>

        <div className="flex items-start justify-between rounded-lg border p-3">
            <div className="space-y-0.5">
                <Label className="text-sm font-medium cursor-pointer">Recurring Transaction</Label>

                <p className="text-sm text-muted-foreground">This transaction will be set as a recurring transaction</p>
            </div>
            <Switch 
                id="isRecurring"
                onCheckedChange={(checked) => setValue("isRecurring", checked)}
                checked={isRecurring}
            />
        </div>

        {isRecurring && (
            <div className="space-y-2">
                <Label className="text-sm font-medium">Recurring Interval</Label>
                <Select
                    onValueChange={(value: any) => setValue("recurringInterval", value)}
                    defaultValue={getValues("recurringInterval")}
                >
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select Recurring Interval" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectGroup>
                            <SelectItem value="DAILY">Daily</SelectItem>
                            <SelectItem value="WEEKLY">Weekly</SelectItem>
                            <SelectItem value="MONTHLY">Monthly</SelectItem>
                            <SelectItem value="YEARLY">Yearly</SelectItem>
                        </SelectGroup>
                    </SelectContent>
                </Select>

                {errors.recurringInterval && (
                    <p className="text-sm text-red-500">{errors.recurringInterval.message}</p>
                )}
            </div>
        )}

        <div className="flex flex-col md:flex-row gap-4 w-full">
            <Button 
                type="submit"
                className="w-full"
                disabled={transactionLoading}
            >
                Add Transaction
            </Button>
            <Button 
                variant="outline" 
                type="button" 
                className="w-full" 
                onClick={() => router.back()}
            >
                Cancel
            </Button>
        </div>
    </form>
  )
}
