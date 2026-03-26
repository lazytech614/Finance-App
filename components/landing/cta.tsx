import Link from 'next/link'
import { Button } from '../ui/button'

export const CTA = () => {
  return (
    <section className="py-20 bg-blue-600 ">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-center mb-4 text-white">Ready to take control of your finance?</h2>
          <p className="text-blue-100 mb-8 max-w-2xl mx-auto">Joinj us today and start managing your finances like a pro</p>
          <Link href={"/dashboard"}>
            <Button size={"lg"} className="bg-white text-blue-600 hover:bg-blue-50 animate-bounce">
              Start Free Trial
            </Button>
          </Link>
        </div>
    </section>
  )
}
