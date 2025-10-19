import { Search, Calendar, Heart } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const steps = [
  {
    icon: Search,
    title: "Find",
    description: "Search verified doctors by specialty, location, or availability across Lebanon and MENA.",
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    icon: Calendar,
    title: "Book",
    description: "Schedule appointments online or in-clinic instantly with real-time availability.",
    color: "text-secondary",
    bgColor: "bg-secondary/10",
  },
  {
    icon: Heart,
    title: "Connect",
    description: "Access teleconsultations, manage medical records, and find pharmacies with your medicines.",
    color: "text-accent",
    bgColor: "bg-accent/10",
  },
];

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-24 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16 animate-fade-in">
          <h2 className="text-4xl sm:text-5xl font-bold mb-4">
            How It Works
          </h2>
          <p className="text-xl text-muted-foreground">
            Three simple steps to access better healthcare
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {steps.map((step, index) => (
            <Card 
              key={index}
              className="relative shadow-soft hover:shadow-hover transition-smooth hover:-translate-y-1 animate-fade-in border-none gradient-feature"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardContent className="pt-12 pb-8 px-6 text-center">
                <div className={`${step.bgColor} ${step.color} w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-soft`}>
                  <step.icon className="h-8 w-8" />
                </div>
                
                <div className="absolute top-4 right-4 text-6xl font-bold text-muted/20">
                  {index + 1}
                </div>

                <h3 className="text-2xl font-bold mb-3">{step.title}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
