import { Inngest } from "inngest";

// Create a client to send and receive events
export const inngest = new Inngest({ 
    id: "welth",
    name: "Welth",
    // FOR PRODUCTION
    eventKey: process.env.INNGEST_EVENT_KEY,  
    retryFunction: async (attempt: number) => ({
        delay: Math.pow(2, attempt) * 1000,
        maxAttempts: 2
    }) 
});