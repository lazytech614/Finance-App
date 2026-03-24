import { getCurrentBudget } from "@/actions/budget"
import { fetchUserAccounts, getDashboardData } from "@/actions/dashboard"
import { AccountCard } from "@/components/dashboard/account-card"
import { BudgetProgress } from "@/components/dashboard/budget-progress"
import { CreateAccountDrawer } from "@/components/dashboard/create-accout-drawer"
import { DashboardOverview } from "@/components/dashboard/dashboard-overview"
import { Card, CardContent } from "@/components/ui/card"
import { PlusCircle } from "lucide-react"
import { Suspense } from "react"

const Dashboard = async () => {
    const accounts = await fetchUserAccounts()

    const defaultAccount = accounts.data.find((account) => account.isDefault)

    let budgetData = null
    if(defaultAccount) {
        budgetData = await getCurrentBudget(defaultAccount.id)
    }

    const transactions = await getDashboardData()

  return (
    <div className="space-y-8">
        {/* BDGET PROGRESS */}
        {defaultAccount && (
            <BudgetProgress intialBudget={budgetData?.budget?.amount ?? 0} currentExpanses={Number(budgetData?.currentExpenses ?? 0)} />
        )}

        {/* OVERVIEW  */}
        <Suspense fallback={<div>Loading...</div>}>
            <DashboardOverview 
                accounts={accounts.data}
                transactions={transactions.data || []}
            />
        </Suspense>

        {/* ACCOUTS GRID  */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            <CreateAccountDrawer>
                <Card className="hover:shadow-md transition-shadow border cursor-pointer h-full">
                    <CardContent className="flex flex-col justify-center items-center text-muted-foreground h-full pt-4">
                        <PlusCircle className="h-10 w-10 mb-2"/>
                        <p className="text-sm font-medium">Add New Account</p>
                    </CardContent>
                </Card>
            </CreateAccountDrawer>

            {accounts.data.map((account) => (
                <AccountCard key={account.id} account={account} />
            ))}
        </div>
    </div>
  )
}

export default Dashboard