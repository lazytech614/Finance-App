import { currentUser } from "@clerk/nextjs/server"
import prisma from "./prisma"

export const checkUser = async() => {
    const user = await currentUser()

    if(!user) {
        return null
    }

    try {
        const loggedInUser = await prisma.user.findUnique({
            where: {
                clerkId: user.id
            }
        })

        if(loggedInUser) {
            return loggedInUser
        }else {
            const name = user.firstName ? `${user.firstName} ${user.lastName}` : user.username
            const newUser = await prisma.user.create({
                data: {
                    clerkId: user.id,
                    email: user.emailAddresses[0].emailAddress,
                    name,
                    imageUrl: user.imageUrl
                }
            })

            return newUser
        }
    }catch(err) {
        console.error(err);
    }
}