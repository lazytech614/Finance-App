"use client"

import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { accountSchema } from "@/lib/schema"
import { Label } from "../ui/label"
import { Input } from "../ui/input"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "../ui/switch"
import { Button } from "../ui/button"
import useFetch from "@/hooks/useFetch"
import { createAccount } from "@/actions/dashboard"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

export const CreateAccountDrawer = ({children}: any) => {
  const [open, setOpen] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset
  } = useForm({
    resolver: zodResolver(accountSchema),
    defaultValues: {
      name: "",
      type: "SAVINGS",
      balance: "",
      isDefault: false
    }
  })

  const {
    data: newAccount, 
    loading: createAccountLoading, 
    error, 
    fn: createAccountFn
  } = useFetch(createAccount)

  useEffect(() => {
    if(newAccount && !createAccountLoading) {
      toast.success("Account created successfully")
      reset()
      setOpen(false)
    }
  }, [newAccount, createAccountLoading])

  useEffect(() => {
    if(error) {
      toast.error((error as Error).message || "Something went wrong")
    }
  }, [error])

  const onSubmit = async(data: any) => {
    await createAccountFn(data)
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger>{children}</DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Create New Account</DrawerTitle>
        </DrawerHeader>
        <div className="px-4 pb-4">
          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-2">
              <Label 
                htmlFor="name" 
                className="text-sm font-medium cursor-pointer"
              >
                Account Name
              </Label>
              <Input 
                id="name" 
                placeholder="e.g. Savings Account" 
                {...register("name")}
                className="mt-1"
              />
              {errors.name && <span className="text-red-500 text-sm">{errors.name.message}</span>}
            </div>

            <div className="space-y-2">
              <Label 
                htmlFor="type" 
                className="text-sm font-medium cursor-pointer"
              >
                Account Type
              </Label>
              <Select
                onValueChange={(value: `SAVINGS` | `CURRENT`) => {
                  setValue("type", value)
                }}
                defaultValue={watch("type")}
              >
                <SelectTrigger id="type" className="w-45">
                  <SelectValue placeholder="Select Account Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="SAVINGS">Savings</SelectItem>
                    <SelectItem value="CURRENT">Current</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
              {errors.type && <span className="text-red-500 text-sm">{errors.type.message}</span>}
            </div>

            <div className="space-y-2">
              <Label 
                htmlFor="balance" 
                className="text-sm font-medium cursor-pointer"
              >
                Initial Balance
              </Label>
              <Input 
                id="balance" 
                type="number"
                step={"0.01"}
                placeholder="0.00" 
                {...register("balance")}
                className="mt-1"
              />
              {errors.balance && <span className="text-red-500 text-sm">{errors.balance.message}</span>}
            </div>

            <div className="flex justify-between items-start rounded-lg border-2 shadow-md p-4">
              <div className="space-y-0.5">
                <Label 
                  htmlFor="isDefault" 
                  className="text-sm font-medium cursor-pointer"
                >
                  Set as Default
                </Label>
                <p className="text-sm text-muted-foreground">This account will be selected by default for transactions</p>
              </div>

              <Switch
                id="isDefault"
                checked={watch("isDefault")}
                onCheckedChange={(checked) => {
                  setValue("isDefault", checked)
                }}
              />
              {errors.isDefault && <span className="text-red-500 text-sm">{errors.isDefault.message}</span>}
            </div>

            <div className="flex gap-x-4 pt-4">
              <DrawerClose className="flex-1">
                <Button type="button" className="w-full text-sm" variant={"outline"}>Cancel</Button>
              </DrawerClose>
              <Button 
                type="submit" 
                className="flex-1 text-sm" 
                disabled={createAccountLoading}
              >
                {createAccountLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin"/>Creating</> : "Create Account"}
              </Button>
            </div>
          </form>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
