import { fetchUserAccounts } from "@/actions/dashboard"
import { getTransaction } from "@/actions/transaction"
import { AddTransactionForm } from "@/components/transaction/add-transaction-form"
import { defaultCategories } from "@/data/categories"

export const dynamic = "force-dynamic"
export const fetchCache = "force-no-store"
export const revalidate = 0
export const runtime = "nodejs"

type Props = {
  searchParams?: {
    edit?: string
  }
}

const Transaction = async ({ searchParams }: Props) => {
  let accounts = null
  let initialData = null

  const editId = searchParams?.edit

  try {
    accounts = await fetchUserAccounts()
  } catch (err) {
    console.error("Error fetching accounts:", err)
  }

  if (editId) {
    try {
      const transaction = await getTransaction(editId)
      initialData = transaction
    } catch (err) {
      console.error("Error fetching transaction:", err)
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-5">
      <h1 className="text-5xl gradient-title mb-5">
        {editId ? "Edit" : "Add"} Transaction
      </h1>

      <AddTransactionForm
        accounts={accounts?.data || []}
        categories={defaultCategories}
        editMode={!!editId}
        intialData={initialData?.data}
        editId={editId}
      />
    </div>
  )
}

export default Transaction