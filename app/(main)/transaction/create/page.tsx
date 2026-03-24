import { fetchUserAccounts } from "@/actions/dashboard"
import { getTransaction } from "@/actions/transaction"
import { AddTransactionForm } from "@/components/transaction/add-transaction-form"
import { defaultCategories } from "@/data/categories"

const Transaction = async({ searchParams }: { searchParams: URLSearchParams | any }) => {
    const accounts = await fetchUserAccounts()

    const params = await searchParams
    const editId = params?.edit

    let intialData = null
    if(editId) {
      const transaction = await getTransaction(editId)
      intialData = transaction
    }

  return (
    <div className="max-w-3xl mx-auto px-5">
        <h1 className="text-5xl gradient-title mb-5">{editId ? "Edit" : "Add"} Transaction</h1>

        <AddTransactionForm 
          accounts={accounts.data} 
          categories={defaultCategories} 
          editMode={!!editId}
          intialData={intialData?.data}
          editId={editId}
        />
    </div>
  )
}

export default Transaction