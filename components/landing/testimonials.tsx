import { testimonialsData } from "@/data/landing"
import { Card, CardContent } from "../ui/card"
import Image from "next/image"

export const Testimonials = () => {
  return (
      <section className="py-20">
        {/* TODO: Will show this in carousel later */}
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">What our users say</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {testimonialsData.map((testimonial, index) => (
                <Card key={index} className="p-6">
                  <CardContent className="space-y-4 pt-4">
                    <div className="flex items-center mb-4">
                      <Image 
                        src={testimonial.image}
                        alt={testimonial.name}
                        width={40}
                        height={40}
                        className="rounded-full"
                      />
                      <div className="ml-4">
                        <h3 className="text-xl font-semibold">{testimonial.name}</h3>
                        <p className="text-sm text-gray-600">{testimonial.role}</p>
                      </div>
                    </div>
                    <p className="text-gray-600">{testimonial.quote}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
        </div>
    </section>
  )
}
