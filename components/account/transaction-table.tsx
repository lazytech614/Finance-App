"use client"

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "../ui/checkbox"
import { format } from "date-fns"
import { categoryColors } from "@/data/categories"
import { Badge } from "../ui/badge"
import { ChevronDown, ChevronUp, Clock, MoreHorizontal, RefreshCcw, Search, Trash, X } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useMemo, useState } from "react"
import { Input } from "../ui/input"
import useFetch from "@/hooks/useFetch"
import { bulkDeleteTransactions } from "@/actions/accounts"
import { toast } from "sonner"
import { BarLoader } from "react-spinners"

type RecurringInterval = "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY";

const RECURRING_INTERVALS: Record<RecurringInterval, string> = {
  DAILY: "Daily",
  WEEKLY: "Weekly",
  MONTHLY: "Monthly",
  YEARLY: "Yearly",
};

export const TransactionTable = ({transactions}: any) => {
    const router = useRouter()
    const {
        loading: deleteLoading,
        fn: deleteFn,
        data: deleted
    } = useFetch(bulkDeleteTransactions)

    const [selectedIds, setSelectedIds] = useState<string[]>([])
    const [sortConfig, setSortConfig] = useState({
        field: "date",
        direction: "desc"
    })
    const [searchTerm, setSearchTerm] = useState<string>("")
    const [typeFilter, setTypeFilter] = useState<string>("")
    const [recurringFilter, setRecurringFilter] = useState<string>("")

    const filteredAndSortedTransactions = useMemo(() => {
        let filtered = [...transactions]

        if(searchTerm) {
            filtered = filtered.filter((transaction: any) => transaction.description.toLowerCase().includes(searchTerm.toLowerCase()))
        }

        if(recurringFilter) {
            filtered = filtered.filter((transaction: any) => {
                if(recurringFilter === "recurring") {
                    return transaction.isRecurring
                }else {
                    return !transaction.isRecurring
                }
            })
        }

        if(typeFilter) {
            filtered = filtered.filter((transaction: any) => transaction.type === typeFilter)
        }

        filtered.sort((a: any, b: any) => {
            let comparison = 0

            switch(sortConfig.field) {
                case "date":
                    comparison = new Date(a.date).getTime() - new Date(b.date).getTime()
                    break
                case "category":
                    comparison = a.category.localeCompare(b.category)
                    break
                case "amount":
                    comparison = a.amount - b.amount
                    break
                default:
                    comparison = 0
                    break
            }

            return sortConfig.direction === "asc" ? comparison : -comparison;
        })

        return filtered
    }, [transactions, sortConfig, searchTerm, typeFilter, recurringFilter])

    const handleSort = (field: string) => {
        setSortConfig((current) => ({
            field,
            direction: current.field === field ? (current.direction === "asc" ? "desc" : "asc") : "desc"
        }))
    }

    const handleSelect = (id: string) => {
        setSelectedIds((current: string[]) => (
            current?.includes(id) 
                ? current.filter((selectedId: string) => selectedId !== id) 
                : [...current, id]
        ))
    }

    const handleSelectAll = () => {
        setSelectedIds((current: string[]) => (
            current?.length === filteredAndSortedTransactions.length 
            ? []
            : filteredAndSortedTransactions.map((transaction: any) => transaction.id)
        ))
    }

    const handleBulkDelete = async() => {
        // TODO: Crete seperate alert box later 
        if(!window.confirm("Are you sure you want to delete these transactions?")) {
            return
        }

        deleteFn(selectedIds)
    }

    useEffect(() => {
        if(deleted && !deleteLoading) {
            toast.success("Transactions deleted successfully")
            setSelectedIds([])
        }
    }, [deleted, deleteLoading])

  return (
    <div className="space-y-4">
        {deleteLoading && <BarLoader className="mt-4" width={"100%"} color="#9333ea" />}

        {/* FILTERS  */}
        <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                    placeholder="Search transactions..." value={searchTerm} 
                    onChange={(e) => setSearchTerm(e.target.value)} 
                    className="pl-8"
                />
            </div>
            <div className="flex gap-2">
                <Select 
                    value={typeFilter} 
                    onValueChange={ setTypeFilter}
                >
                    <SelectTrigger>
                        <SelectValue placeholder="All Types" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectGroup>
                        <SelectItem value="INCOME">Income</SelectItem>
                        <SelectItem value="EXPENSE">Expense</SelectItem>
                        
                        </SelectGroup>
                    </SelectContent>
                </Select>

                <Select 
                    value={recurringFilter} 
                    onValueChange={(val) => setRecurringFilter(val)}
                >
                    <SelectTrigger className="w-37">
                        <SelectValue placeholder="All Transactions" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectGroup>
                        <SelectItem value="recurring">Recurring Only</SelectItem>
                        <SelectItem value="non-recurring">Non-recurring Only</SelectItem>
                        
                        </SelectGroup>
                    </SelectContent>
                </Select>

                {selectedIds.length > 0 && (
                    <div>
                        <Button 
                            variant={"destructive"} 
                            size={"sm"} 
                            onClick={handleBulkDelete}
                            className="flex items-center gap-x-2 h-full"
                        >
                            <Trash className="h-4 w-4" />
                            Delete Selected ({selectedIds.length})
                        </Button>
                    </div>
                )}

                {(searchTerm || typeFilter || recurringFilter) && (
                    <div>
                        <Button 
                            size={"icon"} 
                            title="Clear filters"
                            onClick={() => {
                                setSearchTerm("")
                                setTypeFilter("")
                                setRecurringFilter("")
                                setSelectedIds([])
                            }}
                        >
                            <X className="h-4 w-4"/>
                        </Button>
                    </div>
                )}
            </div>
        </div>


        {/* TRANSACTIONS TABLE  */}
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-12.5">
                            <Checkbox onCheckedChange={() => handleSelectAll()} checked={selectedIds.length === filteredAndSortedTransactions.length && filteredAndSortedTransactions.length > 0}/>
                        </TableHead>
                        <TableHead 
                            onClick={() => handleSort("date")} className="cursor-pointer"
                        >
                            <div className="flex items-center">
                                Date {sortConfig.field === "date" && (sortConfig.direction === "asc" ? <ChevronUp className="ml-1 h-4 w-4" /> : <ChevronDown className="ml-1 h-4 w-4"/>)}
                            </div>
                        </TableHead>
                        <TableHead>
                            Description
                        </TableHead>
                        <TableHead 
                            onClick={() => handleSort("category")} className="cursor-pointer"
                            >
                            <div className="flex items-center">
                                Category {sortConfig.field === "category" && (sortConfig.direction === "asc" ? <ChevronUp className="ml-1 h-4 w-4" /> : <ChevronDown className="ml-1 h-4 w-4"/>)}
                            </div>
                        </TableHead>
                        <TableHead 
                            onClick={() => handleSort("amount")} className="cursor-pointer"
                            >
                            <div className="flex items-center justify-end">
                                Amount {sortConfig.field === "amount" && (sortConfig.direction === "asc" ? <ChevronUp className="ml-1 h-4 w-4" /> : <ChevronDown className="ml-1 h-4 w-4"/>)}
                            </div>
                        </TableHead>
                        <TableHead>
                            Recurring
                        </TableHead>
                        <TableHead className="w-12.5" />
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {filteredAndSortedTransactions.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={7} className="text-center text-muted-foreground text-sm">
                                No Trasnsactions Found
                            </TableCell>
                        </TableRow>
                    ) : (
                        filteredAndSortedTransactions.map((transaction: any) => (
                            <TableRow key={transaction.id}>
                                <TableCell>
                                    <Checkbox onCheckedChange={() => handleSelect(transaction.id)} checked={selectedIds.includes(transaction.id)} />
                                </TableCell>
                                <TableCell>
                                    {format(new Date(transaction.date), "PP")}
                                </TableCell>
                                <TableCell>
                                    {transaction.description}
                                </TableCell>
                                <TableCell className="capitalize">
                                    <span style={{
                                        background: categoryColors[transaction.category]
                                    }} className="px-2 py-1 rounded text-white text-sm">
                                        {transaction.category}
                                    </span>
                                </TableCell>
                                <TableCell style={{
                                    color: transaction.type === 'INCOME' ? "green" : "red"
                                }} className="text-right font-medium">
                                    {transaction.type === "INCOME" ? "+" : "-"}
                                    &#8377;{transaction.amount.toFixed(2)}
                                </TableCell>
                                <TableCell>
                                    {transaction.isRecurring ? (
                                        <Tooltip>
                                            <TooltipTrigger>
                                                <Badge variant={"outline"} className="gap-1 bg-purple-100 text-purple-700 hover:bg-purple-200">
                                                    <RefreshCcw className="h-3 w-3" />
                                                    {RECURRING_INTERVALS[transaction.recurringInterval as RecurringInterval]}
                                                </Badge>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <div className="text-sm">
                                                    <div className="font-medium">Next Date:</div>
                                                    <div>{format(new Date(transaction.nextRecurringDate), "PP")}</div>
                                                </div>
                                            </TooltipContent>
                                        </Tooltip>
                                    ) : (
                                        <Badge variant={"outline"} className="gap-1">
                                            <Clock className="h-3 w-3" />
                                            One-Time
                                        </Badge>
                                    )}
                                </TableCell>
                                <TableCell>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4"/></Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent>
                                            <DropdownMenuItem onClick={() => (
                                                router.push(`/transaction/create?edit=${transaction.id}`)
                                            )}>
                                                Edit
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem 
                                                onClick={() => (
                                                    deleteFn([transaction.id])
                                                )}
                                                className="text-destructive"
                                            >
                                                Delete
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </div>
    </div>
  )
}
