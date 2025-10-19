import { Stethoscope, FileText, MapPin, Video, Shield, Globe } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const features = [
  {
    icon: Stethoscope,
    title: "Verified Doctors",
    description: "Access a network of certified healthcare professionals across all medical specialties.",
  },
  {
    icon: FileText,
    title: "Medical Records",
    description: "Securely store and access your complete medical history, prescriptions, and test results.",
  },
  {
    icon: MapPin,
    title: "Pharmacy Locator",
    description: "Find nearby pharmacies that have your prescribed medicines or offer delivery services.",
  },
  {
    icon: Video,
    title: "Teleconsultations",
    description: "Connect with doctors through secure video calls from the comfort of your home.",
  },
  {
    icon: Shield,
    title: "Secure & Private",
    description: "Your health data is encrypted and protected with industry-leading security standards.",
  },
  {
    icon: Globe,
    title: "Multilingual Support",
    description: "Available in English and Arabic to serve patients across Lebanon and MENA.",
  },
];

const Features = () => {
  return (
    <section id="features" className="py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16 animate-fade-in">
          <h2 className="text-4xl sm:text-5xl font-bold mb-4">
            Everything You Need for Better Healthcare
          </h2>
          <p className="text-xl text-muted-foreground">
            Comprehensive features designed to make healthcare accessible and convenient
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {features.map((feature, index) => (
            <Card 
              key={index}
              className="shadow-soft hover:shadow-hover transition-smooth hover:-translate-y-1 animate-fade-in border-none"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <CardContent className="pt-8 pb-6 px-6">
                <div className="bg-primary/10 text-primary w-14 h-14 rounded-xl flex items-center justify-center mb-5 shadow-soft">
                  <feature.icon className="h-7 w-7" />
                </div>
                
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
