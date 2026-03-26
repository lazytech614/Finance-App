import { statsData } from "@/data/landing"

export const Stats = () => {
  return (
    <section className="py-20 bg-blue-50 dark:bg-muted/50">
        <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                {statsData.map((stat, index) => (
                <div key={index} className="text-center">
                    <div className="text-4xl font-bold text-blue-600 dark:text-primary mb-2">{stat.value}</div>
                    <div className="text-gray-600">{stat.label}</div>
                  </div>
                ))}
            </div>
        </div>
    </section>
  )
}
