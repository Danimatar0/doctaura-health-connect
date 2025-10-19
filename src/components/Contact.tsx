import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Phone, MapPin } from "lucide-react";

const Contact = () => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Form submission logic would go here
  };

  return (
    <section id="contact" className="py-24 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16 animate-fade-in">
          <h2 className="text-4xl sm:text-5xl font-bold mb-4">
            Get in Touch
          </h2>
          <p className="text-xl text-muted-foreground">
            Have questions? We're here to help you access better healthcare
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          <div className="space-y-8 animate-fade-in">
            <Card className="shadow-soft border-none">
              <CardContent className="pt-6 pb-6 px-6 flex items-start gap-4">
                <div className="bg-primary/10 text-primary w-12 h-12 rounded-xl flex items-center justify-center shadow-soft flex-shrink-0">
                  <Mail className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Email Us</h3>
                  <p className="text-muted-foreground">support@doctaura.com</p>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-soft border-none">
              <CardContent className="pt-6 pb-6 px-6 flex items-start gap-4">
                <div className="bg-secondary/10 text-secondary w-12 h-12 rounded-xl flex items-center justify-center shadow-soft flex-shrink-0">
                  <Phone className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Call Us</h3>
                  <p className="text-muted-foreground">+961 XX XXX XXX</p>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-soft border-none">
              <CardContent className="pt-6 pb-6 px-6 flex items-start gap-4">
                <div className="bg-accent/10 text-accent w-12 h-12 rounded-xl flex items-center justify-center shadow-soft flex-shrink-0">
                  <MapPin className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Visit Us</h3>
                  <p className="text-muted-foreground">Beirut, Lebanon</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="shadow-soft animate-fade-in border-none" style={{ animationDelay: "100ms" }}>
            <CardContent className="pt-8 pb-8 px-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Input
                    placeholder="Your Name"
                    className="border-border focus:ring-primary"
                    required
                  />
                </div>
                <div>
                  <Input
                    type="email"
                    placeholder="Your Email"
                    className="border-border focus:ring-primary"
                    required
                  />
                </div>
                <div>
                  <Textarea
                    placeholder="Your Message"
                    className="border-border focus:ring-primary min-h-[150px]"
                    required
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full gradient-hero text-white shadow-soft hover:shadow-hover transition-smooth"
                >
                  Send Message
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default Contact;
