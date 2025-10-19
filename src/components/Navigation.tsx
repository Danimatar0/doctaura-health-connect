import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Navigation = () => {
  const navigate = useNavigate();
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    element?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div 
            className="flex items-center gap-2 cursor-pointer" 
            onClick={() => navigate('/')}
          >
            <Heart className="h-6 w-6 text-primary" fill="currentColor" />
            <span className="text-xl font-bold text-foreground">Doctaura</span>
          </div>

          <div className="hidden md:flex items-center gap-6">
            <button
              onClick={() => scrollToSection("how-it-works")}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-smooth"
            >
              How It Works
            </button>
            <button
              onClick={() => scrollToSection("features")}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-smooth"
            >
              Features
            </button>
            <button
              onClick={() => scrollToSection("about")}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-smooth"
            >
              About
            </button>
            <button
              onClick={() => scrollToSection("contact")}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-smooth"
            >
              Contact
            </button>
          </div>

          <div className="flex items-center gap-3">
            <Button 
              variant="outline"
              onClick={() => navigate('/patient-dashboard')}
              className="hidden sm:inline-flex"
            >
              Patient Portal
            </Button>
            <Button 
              onClick={() => navigate('/doctors')}
              className="shadow-soft hover:shadow-hover transition-smooth"
            >
              Find Doctors
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
