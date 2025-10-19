import { Target, Users, Zap } from "lucide-react";

const values = [
  {
    icon: Target,
    title: "Our Mission",
    description: "To make healthcare in Lebanon and the Middle East simpler, faster, and more connected for everyone.",
  },
  {
    icon: Users,
    title: "Patient-Centered",
    description: "We put patients first, ensuring accessible, reliable, and compassionate healthcare experiences.",
  },
  {
    icon: Zap,
    title: "Innovation",
    description: "Leveraging cutting-edge technology to bridge the gap between patients and healthcare providers.",
  },
];

const About = () => {
  return (
    <section id="about" className="py-24 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-4xl sm:text-5xl font-bold mb-6">
              About Doctaura
            </h2>
            <p className="text-xl text-muted-foreground leading-relaxed">
              We're transforming healthcare access across Lebanon and the MENA region by creating 
              a seamless digital platform that connects patients, doctors, and pharmacies. Our goal 
              is to make quality healthcare more accessible, efficient, and patient-friendly.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mt-12">
            {values.map((value, index) => (
              <div 
                key={index}
                className="text-center animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="bg-primary/10 text-primary w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-soft">
                  <value.icon className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold mb-3">{value.title}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
