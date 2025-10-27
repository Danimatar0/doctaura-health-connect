import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, MapPin, Phone, Clock, Truck, Shield, Info } from "lucide-react";
import { Pharmacy } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface PharmacyCardProps {
  pharmacy: Pharmacy;
}

const PharmacyCard = ({ pharmacy }: PharmacyCardProps) => {
  return (
    <Card className="shadow-soft hover:shadow-hover transition-smooth overflow-hidden">
      <CardContent className="p-0">
        <div className="flex flex-col sm:flex-row gap-4 p-6">
          <img
            src={pharmacy.image}
            alt={pharmacy.name}
            className="w-24 h-24 rounded-xl object-cover flex-shrink-0"
          />

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex-1 min-w-0">
                <h3 className="text-xl font-bold mb-1 truncate">{pharmacy.name}</h3>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                  <MapPin className="h-4 w-4 flex-shrink-0" />
                  <span className="truncate">{pharmacy.location}</span>
                </div>
              </div>

              {pharmacy.isOpen24Hours && (
                <Badge variant="secondary" className="bg-primary/10 text-primary flex-shrink-0">
                  24/7
                </Badge>
              )}
            </div>

            <div className="flex flex-wrap gap-3 text-sm text-muted-foreground mb-3">
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 text-accent fill-accent" />
                <span>{pharmacy.rating} ({pharmacy.reviewCount})</span>
              </div>
              <div className="flex items-center gap-1">
                <Phone className="h-4 w-4" />
                <span>{pharmacy.phone}</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-3">
              {pharmacy.deliveryAvailable && (
                <Badge variant="outline" className="text-xs">
                  <Truck className="h-3 w-3 mr-1" />
                  Delivery
                </Badge>
              )}
              {pharmacy.acceptsInsurance && (
                <Badge variant="outline" className="text-xs">
                  <Shield className="h-3 w-3 mr-1" />
                  Insurance
                </Badge>
              )}
              <Badge variant="outline" className="text-xs">
                <Clock className="h-3 w-3 mr-1" />
                {pharmacy.isOpen24Hours ? "Open 24/7" : "See Hours"}
              </Badge>
            </div>

            <div className="flex flex-wrap gap-2">
              {pharmacy.services.slice(0, 3).map((service) => (
                <span
                  key={service}
                  className="text-xs bg-muted px-2 py-1 rounded-full"
                >
                  {service}
                </span>
              ))}
              {pharmacy.services.length > 3 && (
                <span className="text-xs text-muted-foreground px-2 py-1">
                  +{pharmacy.services.length - 3} more
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-2 sm:w-40">
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  className="gradient-hero text-white shadow-soft hover:shadow-hover transition-smooth w-full"
                >
                  <Info className="h-4 w-4 mr-2" />
                  View Details
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="text-2xl">{pharmacy.name}</DialogTitle>
                  <DialogDescription>
                    Complete pharmacy information and services
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 mt-4">
                  {/* Contact Information */}
                  <div>
                    <h3 className="font-semibold text-lg mb-3">Contact Information</h3>
                    <div className="space-y-2">
                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-medium">Address</p>
                          <p className="text-sm text-muted-foreground">{pharmacy.address}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <Phone className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-medium">Phone</p>
                          <p className="text-sm text-muted-foreground">{pharmacy.phone}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Opening Hours */}
                  <div>
                    <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                      <Clock className="h-5 w-5 text-primary" />
                      Opening Hours
                    </h3>
                    <div className="space-y-2 bg-muted/30 p-4 rounded-lg">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Monday - Friday</span>
                        <span className="text-sm text-muted-foreground">{pharmacy.openingHours.weekdays}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Saturday</span>
                        <span className="text-sm text-muted-foreground">{pharmacy.openingHours.saturday}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Sunday</span>
                        <span className="text-sm text-muted-foreground">{pharmacy.openingHours.sunday}</span>
                      </div>
                    </div>
                  </div>

                  {/* Services */}
                  <div>
                    <h3 className="font-semibold text-lg mb-3">Services Offered</h3>
                    <div className="flex flex-wrap gap-2">
                      {pharmacy.services.map((service) => (
                        <Badge key={service} variant="secondary" className="text-sm">
                          {service}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Medications */}
                  <div>
                    <h3 className="font-semibold text-lg mb-3">Available Medications</h3>
                    <div className="grid grid-cols-2 gap-2">
                      {pharmacy.medications.map((med) => (
                        <div key={med} className="text-sm bg-muted/30 px-3 py-2 rounded-lg">
                          {med}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Features */}
                  <div>
                    <h3 className="font-semibold text-lg mb-3">Features</h3>
                    <div className="grid sm:grid-cols-2 gap-3">
                      <div className={`flex items-center gap-2 p-3 rounded-lg ${
                        pharmacy.isOpen24Hours ? "bg-primary/10 text-primary" : "bg-muted/30"
                      }`}>
                        <Clock className="h-5 w-5" />
                        <span className="text-sm font-medium">
                          {pharmacy.isOpen24Hours ? "Open 24/7" : "Regular Hours"}
                        </span>
                      </div>
                      <div className={`flex items-center gap-2 p-3 rounded-lg ${
                        pharmacy.deliveryAvailable ? "bg-primary/10 text-primary" : "bg-muted/30"
                      }`}>
                        <Truck className="h-5 w-5" />
                        <span className="text-sm font-medium">
                          {pharmacy.deliveryAvailable ? "Home Delivery" : "No Delivery"}
                        </span>
                      </div>
                      <div className={`flex items-center gap-2 p-3 rounded-lg ${
                        pharmacy.acceptsInsurance ? "bg-primary/10 text-primary" : "bg-muted/30"
                      }`}>
                        <Shield className="h-5 w-5" />
                        <span className="text-sm font-medium">
                          {pharmacy.acceptsInsurance ? "Accepts Insurance" : "No Insurance"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 p-3 rounded-lg bg-primary/10 text-primary">
                        <Star className="h-5 w-5 fill-current" />
                        <span className="text-sm font-medium">
                          {pharmacy.rating} Rating ({pharmacy.reviewCount} reviews)
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            <Button
              variant="outline"
              onClick={() => window.open(`tel:${pharmacy.phone}`, '_self')}
              className="w-full"
            >
              <Phone className="h-4 w-4 mr-2" />
              Call Now
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PharmacyCard;
