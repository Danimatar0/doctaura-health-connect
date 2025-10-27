import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Search } from "lucide-react";

interface PharmacyFiltersProps {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  location: string;
  setLocation: (value: string) => void;
  medication: string;
  setMedication: (value: string) => void;
  open24Hours: boolean;
  setOpen24Hours: (value: boolean) => void;
  deliveryAvailable: boolean;
  setDeliveryAvailable: (value: boolean) => void;
  acceptsInsurance: boolean;
  setAcceptsInsurance: (value: boolean) => void;
}

const locations = [
  "All Locations",
  "Beirut",
  "Tripoli",
  "Sidon",
  "Zahle",
  "Tyre",
];

const medications = [
  "All Medications",
  "Antibiotics",
  "Pain Relief",
  "Diabetes Medication",
  "Heart Medication",
  "Vitamins",
  "Asthma Medication",
  "Emergency Medication",
];

const PharmacyFilters = ({
  searchQuery,
  setSearchQuery,
  location,
  setLocation,
  medication,
  setMedication,
  open24Hours,
  setOpen24Hours,
  deliveryAvailable,
  setDeliveryAvailable,
  acceptsInsurance,
  setAcceptsInsurance,
}: PharmacyFiltersProps) => {
  // Local state for temporary filter values
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);
  const [localLocation, setLocalLocation] = useState(location);
  const [localMedication, setLocalMedication] = useState(medication);
  const [localOpen24Hours, setLocalOpen24Hours] = useState(open24Hours);
  const [localDeliveryAvailable, setLocalDeliveryAvailable] = useState(deliveryAvailable);
  const [localAcceptsInsurance, setLocalAcceptsInsurance] = useState(acceptsInsurance);

  const handleApplyFilters = () => {
    setSearchQuery(localSearchQuery);
    setLocation(localLocation);
    setMedication(localMedication);
    setOpen24Hours(localOpen24Hours);
    setDeliveryAvailable(localDeliveryAvailable);
    setAcceptsInsurance(localAcceptsInsurance);
  };

  const handleResetFilters = () => {
    const defaultValues = {
      searchQuery: "",
      location: "All Locations",
      medication: "All Medications",
      open24Hours: false,
      deliveryAvailable: false,
      acceptsInsurance: false,
    };

    setLocalSearchQuery(defaultValues.searchQuery);
    setLocalLocation(defaultValues.location);
    setLocalMedication(defaultValues.medication);
    setLocalOpen24Hours(defaultValues.open24Hours);
    setLocalDeliveryAvailable(defaultValues.deliveryAvailable);
    setLocalAcceptsInsurance(defaultValues.acceptsInsurance);

    setSearchQuery(defaultValues.searchQuery);
    setLocation(defaultValues.location);
    setMedication(defaultValues.medication);
    setOpen24Hours(defaultValues.open24Hours);
    setDeliveryAvailable(defaultValues.deliveryAvailable);
    setAcceptsInsurance(defaultValues.acceptsInsurance);
  };

  return (
    <Card className="shadow-soft">
      <CardContent className="pt-6 space-y-6">
        <div>
          <Label htmlFor="search" className="mb-2 block">Search</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="search"
              placeholder="Search by name or medication..."
              value={localSearchQuery}
              onChange={(e) => setLocalSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="location" className="mb-2 block">Location</Label>
          <Select value={localLocation} onValueChange={setLocalLocation}>
            <SelectTrigger id="location">
              <SelectValue placeholder="Select location" />
            </SelectTrigger>
            <SelectContent className="bg-background z-50">
              {locations.map((loc) => (
                <SelectItem key={loc} value={loc}>
                  {loc}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="medication" className="mb-2 block">Medication Type</Label>
          <Select value={localMedication} onValueChange={setLocalMedication}>
            <SelectTrigger id="medication">
              <SelectValue placeholder="Select medication" />
            </SelectTrigger>
            <SelectContent className="bg-background z-50">
              {medications.map((med) => (
                <SelectItem key={med} value={med}>
                  {med}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-4 pt-2">
          <Label className="text-base">Services & Features</Label>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="open24Hours"
              checked={localOpen24Hours}
              onCheckedChange={(checked) => setLocalOpen24Hours(checked as boolean)}
            />
            <label
              htmlFor="open24Hours"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
            >
              Open 24/7
            </label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="delivery"
              checked={localDeliveryAvailable}
              onCheckedChange={(checked) => setLocalDeliveryAvailable(checked as boolean)}
            />
            <label
              htmlFor="delivery"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
            >
              Home Delivery Available
            </label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="insurance"
              checked={localAcceptsInsurance}
              onCheckedChange={(checked) => setLocalAcceptsInsurance(checked as boolean)}
            />
            <label
              htmlFor="insurance"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
            >
              Accepts Insurance
            </label>
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <Button
            onClick={handleApplyFilters}
            className="flex-1"
          >
            Apply Filters
          </Button>
          <Button
            onClick={handleResetFilters}
            variant="outline"
            className="flex-1"
          >
            Reset Filters
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PharmacyFilters;
