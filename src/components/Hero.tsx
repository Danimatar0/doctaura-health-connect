import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import heroImage from "@/assets/hero-healthcare.jpg";

const Hero = () => {
  const navigate = useNavigate();
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 gradient-hero opacity-10"></div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8 animate-fade-in">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight">
              Your Health,{" "}
              <span className="text-primary">
                Connected
              </span>
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-2xl">
              Find verified doctors, book appointments instantly, manage your medical records, 
              and locate pharmacies with your prescribed medicines across Lebanon and MENA.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                size="lg"
                onClick={() => navigate('/doctors')}
                className="gradient-hero text-white shadow-soft hover:shadow-hover transition-smooth group"
              >
                Find a Doctor
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-smooth" />
              </Button>
            </div>

            <div className="flex items-center gap-8 pt-8">
              <div>
                <p className="text-3xl font-bold text-primary">1000+</p>
                <p className="text-sm text-muted-foreground">Verified Doctors</p>
              </div>
              <div className="h-12 w-px bg-border"></div>
              <div>
                <p className="text-3xl font-bold text-secondary">500+</p>
                <p className="text-sm text-muted-foreground">Partner Pharmacies</p>
              </div>
              <div className="h-12 w-px bg-border"></div>
              <div>
                <p className="text-3xl font-bold text-accent">24/7</p>
                <p className="text-sm text-muted-foreground">Support Available</p>
              </div>
            </div>
          </div>

          <div className="relative animate-scale-in">
            <div className="absolute inset-0 gradient-hero opacity-20 blur-3xl rounded-full"></div>
            <img
              src={heroImage}
              alt="Healthcare professionals connecting with patients through digital technology"
              className="relative rounded-2xl shadow-hover"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
