import { Inngest } from "inngest";

// Create a client to send and receive events
export const inngest = new Inngest({ 
    id: "budgetai",
    name: "BudgetAI",
    // FOR PRODUCTION
    eventKey: process.env.INNGEST_EVENT_KEY,  
    retryFunction: async (attempt: number) => ({
        delay: Math.pow(2, attempt) * 1000,
        maxAttempts: 2
    }) 
});