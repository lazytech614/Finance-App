import { fetchUserAccounts } from "@/actions/dashboard"
import { AddTransactionForm } from "@/components/transaction/add-transaction-form"
import { defaultCategories } from "@/data/categories"

const Transaction = async() => {
    const accounts = await fetchUserAccounts()

  return (
    <div className="max-w-3xl mx-auto px-5">
        <h1 className="text-5xl gradient-title mb-5">Add Transaction</h1>

        <AddTransactionForm accounts={accounts.data} categories={defaultCategories} />
    </div>
  )
}

export default Transaction