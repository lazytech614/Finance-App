"use client"

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>

      <p className="mb-4">
        Welcome to BudgetAI. By accessing or using our services, you agree to comply with these Terms of Service.
      </p>

      <ul className="list-disc pl-5 space-y-2">
        <li>All users must provide accurate information when registering.</li>
        <li>Transactions and financial data entered into BudgetAI are your responsibility.</li>
        <li>We reserve the right to modify the app and these terms at any time.</li>
        <li>Violation of these terms may result in account suspension or termination.</li>
      </ul>

      <p className="mt-4">
        For any questions regarding these terms, please contact us at <a href="mailto:support@budget.ai.com" className="text-blue-600">support@budget.ai.com</a>.
      </p>
    </div>
  )
}