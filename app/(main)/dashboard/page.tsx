import { fetchUserAccounts } from "@/actions/dashboard"
import { AccountCard } from "@/components/dashboard/account-card"
import { CreateAccountDrawer } from "@/components/dashboard/create-accout-drawer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { PlusCircle } from "lucide-react"

const Dashboard = async () => {
    const accounts = await fetchUserAccounts()

  return (
    <div >
        {/* BDGET PROGRESS */}

        {/* OVERVIEW  */}

        {/* ACCOUTS GRID  */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            <CreateAccountDrawer>
                <Card className="hover:shadow-md transition-shadow border cursor-pointer">
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