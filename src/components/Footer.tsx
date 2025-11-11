import doctauraLogo from "@/assets/doctaura_icon.png";

const Footer = () => {
  return (
    <footer className="bg-foreground text-background py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <img src={doctauraLogo} alt="Doctaura" className="h-8 w-auto brightness-0 invert" />
            </div>
            <p className="text-background/70">
              Your health, connected across Lebanon and MENA.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-4">For Patients</h3>
            <ul className="space-y-2 text-background/70">
              <li>
                <a href="#" className="hover:text-background transition-smooth">
                  Find Doctors
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-background transition-smooth">
                  Book Appointments
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-background transition-smooth">
                  Medical Records
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-background transition-smooth">
                  Find Pharmacies
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">For Providers</h3>
            <ul className="space-y-2 text-background/70">
              <li>
                <a href="#" className="hover:text-background transition-smooth">
                  Join as Doctor
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-background transition-smooth">
                  Partner Pharmacy
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-background transition-smooth">
                  Provider Portal
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Company</h3>
            <ul className="space-y-2 text-background/70">
              <li>
                <a href="#about" className="hover:text-background transition-smooth">
                  About Us
                </a>
              </li>
              <li>
                <a href="#contact" className="hover:text-background transition-smooth">
                  Contact
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-background transition-smooth">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-background transition-smooth">
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-background/20 pt-8 text-center text-background/70">
          <p>&copy; {new Date().getFullYear()} Doctaura. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
