import { getAccountWithTransaction } from "@/actions/accounts"
import { notFound } from "next/navigation"

const Account = async({params}: any) => {
    const {id} = await params
    const accountData = await getAccountWithTransaction(id)

    if(!accountData) {
        notFound()
    }

    const {transactions, ...account} = accountData

  return (
    <div className="px-4 flex gap-4 items-end justify-between">
        <div>
            <h1 className="text-5xl sm:text-6xl font-bold gradient-title capitalize">{account.name}</h1>
            <p className="text-muted-foreground">{account?.type.charAt(0).toUpperCase() + account?.type.slice(1)}</p>
        </div>
        <div className="text-right pb-2">
            <h2 className="text-xl sm:text-2xl font-bold">&#8377;{parseFloat(account.balance).toFixed(2)}</h2>
            <p className="text-sm text-muted-foreground">{account._count.transactions} Transactions</p>
        </div>
    </div>
  )
}

export default Account