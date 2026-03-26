import { Show, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs"
import Image from "next/image"
import Link from "next/link"
import { Button } from "../ui/button"
import { LayoutDashboard, SquarePen } from "lucide-react"
import { checkUser } from "@/lib/checkUser"

export const Header = async () => {
  await checkUser()

  return (
    <header className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 border-b">
      <nav className="container mx-auto p-4 flex justify-between items-center">
        <Link href="/">
          <Image 
            src={"/logo.png"} 
            alt="logo" 
            width={200} 
            height={60} 
            className="h-12 w-auto object-contain"
          />
        </Link>
        <div>
          <Show when="signed-out">
            <div className="flex gap-x-2 items-center">
              <SignInButton forceRedirectUrl={"/dashboard"}>
                <Button variant={'outline'} className="">Sign In</Button>
              </SignInButton>
              <SignUpButton>
                <Button  className="">
                  Sign Up
                </Button>
              </SignUpButton>
            </div>
          </Show>

          <Show when="signed-in">
            <div className="flex items-center gap-x-2">
              <Link href="/dashboard">
                <Button variant={'outline'}>
                  <LayoutDashboard size={18} className="md:mr-2"/>
                  <span className="hidden md:inline">Dashboard</span>
                </Button>
              </Link>
              <Link href="/transaction/create">
                <Button>
                  <SquarePen size={18} className="md:mr-2"/>
                  <span className="hidden md:inline">Add Transaction</span>
                </Button>
              </Link>
              <UserButton appearance={{
                elements: {
                  avatarBox: "w-10 h-10"
                }
              }} />
            </div>
          </Show>
        </div>
      </nav>
    </header>
  )
}
