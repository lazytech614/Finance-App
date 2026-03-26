"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

export default function HelpPage() {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Help Center</h1>

      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>How do I add a new transaction?</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Go to the Transactions page and click the "Add Transaction" button. Fill in the details and save.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Can I export my reports?</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Yes! In the Reports section, click the "Export" button to download CSV or PDF reports.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>How is my data secured?</CardTitle>
          </CardHeader>
          <CardContent>
            <p>We use industry-standard encryption and secure servers to protect your personal and financial data.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}