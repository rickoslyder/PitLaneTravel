"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { motion } from "framer-motion"

const testimonials = [
  {
    name: "Sarah L.",
    avatar: "SL",
    text: "PitLane Travel made planning my first F1 trip a breeze. I felt so confident and prepared!",
    image: "/placeholder.svg?height=100&width=100"
  },
  {
    name: "Mike R.",
    avatar: "MR",
    text: "The circuit-specific guides saved me hours of research. Absolutely invaluable resource!",
    image: "/placeholder.svg?height=100&width=100"
  },
  {
    name: "Emma T.",
    avatar: "ET",
    text: "Thanks to PitLane Travel, I discovered the best viewing spots and local tips I wouldn't have found otherwise.",
    image: "/placeholder.svg?height=100&width=100"
  }
]

export default function TestimonialSection() {
  return (
    <section className="mt-20 bg-gradient-to-b from-gray-50 to-white py-20 dark:from-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <h2 className="mb-4 text-center text-4xl font-bold">
            What Our Users Say
          </h2>
          <p className="text-muted-foreground mx-auto mb-12 max-w-2xl text-center text-lg">
            Join thousands of F1 fans who've discovered their perfect race
            experience with PitLane Travel.
          </p>
          <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 md:grid-cols-3">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
              >
                <Card className="group h-full transition-shadow duration-200 hover:shadow-lg">
                  <CardHeader className="flex flex-col items-center">
                    <Avatar className="mb-4 size-20">
                      <AvatarImage
                        src={testimonial.image}
                        alt={testimonial.name}
                      />
                      <AvatarFallback>{testimonial.avatar}</AvatarFallback>
                    </Avatar>
                    <CardTitle className="text-xl">
                      {testimonial.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground text-center italic">
                      &ldquo;{testimonial.text}&rdquo;
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
