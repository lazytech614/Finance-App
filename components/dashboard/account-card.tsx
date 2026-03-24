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
import { Switch } from "../ui/switch"
import { ArrowDownRight, ArrowUpRight } from "lucide-react"
import Link from "next/link"
import useFetch from "@/hooks/useFetch"
import { updateDefaultAccount } from "@/actions/accounts"
import { toast } from "sonner"
import { useEffect } from "react"

export const AccountCard = ({account}: any) => {
    const {name, type, id, balance, isDefault} = account

    const {
        loading: updateDefaultAccountLoading,
        fn: updateDefaultAccountFn,
        data: updateDefaultAccountData,
        error
    } = useFetch(updateDefaultAccount)

    const handleDefaultChange = async(e: any) => {
        e.preventDefault()

        if(isDefault){
            toast.warning("You need atlast one default account to continue")
            return
        }

        await updateDefaultAccountFn(id)
    }

    useEffect(() => {
        if((updateDefaultAccountData as any).success) {
            console.log(updateDefaultAccountData)
            toast.success("Default account updated successfully")
        }
    }, [updateDefaultAccountData, updateDefaultAccountLoading])

    useEffect(() => {
        if(error) {
            toast.error((error as Error).message || "Something went wrong")
        }
    }, [error])

  return (
    <Card className="hover:shadow-md transition-shadow group relative">
        <Link href={`/account/${id}`}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium capitalize">{name}</CardTitle>
                <Switch 
                    onClick={handleDefaultChange} 
                    checked={isDefault} 
                    disabled={updateDefaultAccountLoading}
                />
            </CardHeader>
            <CardContent>
                <h4 className="text-2xl font-bold">&#8377;{parseFloat(balance).toFixed(2)}</h4>
                <p className="text-sm text-muted-foreground">{type.charAt(0).toUpperCase() + type.slice(1).toLowerCase()} Account</p> 
            </CardContent>
            <CardFooter className="flex justify-between text-sm text-muted-foreground">
                <div className="flex items-center">
                    <ArrowUpRight className="mr-1 h-4 w-4 text-green-500"/> Income
                </div>
                <div className="flex items-center">
                    <ArrowDownRight className="mr-1 h-4 w-4 text-red-500"/> Expanse
                </div>
            </CardFooter>
        </Link>
    </Card>
  )
}
