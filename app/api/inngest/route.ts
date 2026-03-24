import { serve } from "inngest/next";
import { inngest } from "../../../lib/ingest/client";
import { checkBudgetAlerts, generateMonthlyReport, processRecurringTransaction, triggerRecurringTransactions } from "@/lib/ingest/functions";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    checkBudgetAlerts,
    triggerRecurringTransactions,
    processRecurringTransaction,
    generateMonthlyReport
  ],
});