import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import HowItWorks from "@/components/HowItWorks";
import Features from "@/components/Features";
import About from "@/components/About";
import Testimonials from "@/components/Testimonials";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import { keycloakService } from "@/services/keycloakService";

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect authenticated users to their dashboard
    const user = keycloakService.getCurrentUser();
    if (user && keycloakService.isAuthenticated()) {
      const dashboardUrl = keycloakService.getDashboardUrl(user.role);
      navigate(dashboardUrl, { replace: true });
    }
  }, [navigate]);

  return (
    <div className="min-h-screen">
      <Navigation />
      <main>
        <Hero />
        <HowItWorks />
        <Features />
        <About />
        <Testimonials />
        <Contact />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
