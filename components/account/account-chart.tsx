"use client"

import { endOfDay, format, startOfDay, subDays } from 'date-fns';
import { useMemo, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Rectangle, ResponsiveContainer } from 'recharts';
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { formatIndianCurrency } from '@/lib/formatIndianCurrency';

const DATE_RANGES = {
    "7D": {label: "Last 7 Days", days: 7},
    "1M": {label: "Last Month", days: 30},
    "3M": {label: "Last 3 Months", days: 90},
    "6M": {label: "Last 6 Months", days: 180},
    ALL: {label: "All Time", days: null},
}

export const AccountChart = ({transactions}: any) => {
    const [dateRange, setDateRange] = useState("1M")

    const filteredData = useMemo(() => {
        const range = DATE_RANGES[dateRange as keyof typeof DATE_RANGES]
        const now = new Date()

        const startDate = range.days
            ? startOfDay(subDays(now, range.days))
            : startOfDay(new Date(0))

        const filtered = transactions.filter((transaction: any) => new Date(transaction.date) >= startDate && new Date(transaction.date) <= endOfDay(now))

        const grouped = filtered.reduce((acc: any, transaction: any) => {
            const date = format(new Date(transaction.date), "MMM dd")

            if(!acc[date]) {
                acc[date] = {date, income: 0, expense: 0}
            }

            if(transaction.type === "INCOME") {
                acc[date].income += transaction.amount
            } else {
                acc[date].expense += transaction.amount
            }

            return acc
        }, {})

        return Object.values(grouped).sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());
    },[transactions, dateRange])

    const totals = useMemo(() => {
        return filteredData.reduce<{income: number, expense: number}>(
            (acc: any, day: any) => {
            return {
                income: acc.income + day.income,
                expense: acc.expense + day.expense,
            }
            },
            { income: 0, expense: 0 }
        )
    }, [filteredData])

  return (
    <div>
        <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-7'>
                <CardTitle className='text-base font-normal'>Transaction Overview</CardTitle>
                <Select defaultValue={dateRange} onValueChange={setDateRange}>
                    <SelectTrigger className="w-35">
                        <SelectValue placeholder="Select Range" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectGroup>
                            {Object.entries(DATE_RANGES).map(([key, value]) => (
                            <SelectItem key={key} value={key}>
                                {value.label}
                            </SelectItem>
                            ))}
                        </SelectGroup>
                    </SelectContent>
                </Select>
            </CardHeader>
            <CardContent>
                <div className='flex flex-row items-center justify-around mb-6 text-sm'>
                    <div className='text-center'>
                        <p className='text-muted-foreground'>Total Income</p>
                        <p className='text-lg font-bold text-green-500'>&#8377;{formatIndianCurrency(totals.income)}</p>
                    </div>
                    <div className='text-center'>
                        <p className='text-muted-foreground'>Total Expense</p>
                        <p className='text-lg font-bold text-red-500'>&#8377;{formatIndianCurrency(totals.expense)}</p>
                    </div>
                    <div className='text-center'>
                        <p className='text-muted-foreground'>Net</p>
                        <p className={`text-lg font-bold ${totals.income - totals.expense >= 0 ? "text-green-500" : "text-red-500"}`}>&#8377;{formatIndianCurrency(totals.income - totals.expense)}</p>
                    </div>
                </div>

                <div className="h-75 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={filteredData}
                            margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
                            >
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            
                            <XAxis dataKey="date" />
                            
                            <YAxis
                                width={60}
                                tickFormatter={(val) => `₹${val}`} 
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                            />

                            <Tooltip formatter={(val) => [`₹${val}`, undefined]} />
                            <Legend />

                            <Bar
                                dataKey="income"
                                name="Income"
                                fill="#22c55e"
                                radius={[4, 4, 0, 0]}
                            />

                            <Bar
                                dataKey="expense"
                                name="Expense"
                                fill="#ef4444"
                                radius={[4, 4, 0, 0]}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
        
    </div>
  )
}
