"use client"

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>

      <p className="mb-4">
        Welth values your privacy. We only collect information necessary to provide our services. All data is encrypted and never shared with third parties without your consent.
      </p>

      <p className="mb-4">
        By using our app, you agree to our policies regarding data collection, storage, and processing.
      </p>

      <ul className="list-disc pl-5 space-y-2">
        <li>We encrypt all financial data.</li>
        <li>We do not sell or share your personal information.</li>
        <li>You can request data deletion anytime.</li>
      </ul>
    </div>
  )
}