import { Card, CardContent } from "@/components/ui/card";
import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Sarah M.",
    role: "Patient",
    content: "Doctaura made it so easy to find a specialist for my condition. I booked an appointment in minutes and the doctor was excellent.",
    rating: 5,
  },
  {
    name: "Dr. Ahmad K.",
    role: "Cardiologist",
    content: "As a doctor, this platform has streamlined my appointment management and helped me reach more patients who need care.",
    rating: 5,
  },
  {
    name: "Layla H.",
    role: "Patient",
    content: "The pharmacy locator feature saved me hours of searching. I found my prescription medicine at a nearby pharmacy instantly.",
    rating: 5,
  },
];

const Testimonials = () => {
  return (
    <section className="py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16 animate-fade-in">
          <h2 className="text-4xl sm:text-5xl font-bold mb-4">
            Trusted by Thousands
          </h2>
          <p className="text-xl text-muted-foreground">
            Real experiences from our community of patients and healthcare providers
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <Card 
              key={index}
              className="shadow-soft hover:shadow-hover transition-smooth animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardContent className="pt-6 pb-6 px-6">
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-accent fill-accent" />
                  ))}
                </div>
                
                <p className="text-muted-foreground leading-relaxed mb-6">
                  "{testimonial.content}"
                </p>
                
                <div>
                  <p className="font-semibold">{testimonial.name}</p>
                  <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
