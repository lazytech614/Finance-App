"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import Link from "next/link"

const posts = [
  { title: "5 Tips to Save More Money", href: "/blog/5-tips-to-save-more-money", description: "Learn practical ways to save more every month." },
  { title: "Understanding Personal Finance", href: "/blog/understanding-personal-finance", description: "A beginner-friendly guide to managing money." },
  { title: "Investing for Beginners", href: "/blog/investing-for-beginners", description: "Simple tips to start your investment journey." },
]

export default function BlogPage() {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Blog</h1>

      <div className="space-y-4">
        {posts.map((post, i) => (
          <Card key={i} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle>
                <Link href={post.href} className="hover:text-blue-600">{post.title}</Link>
              </CardTitle>
              <CardDescription>{post.description}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  )
}