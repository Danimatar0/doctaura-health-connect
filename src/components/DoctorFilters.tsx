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
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

interface DoctorFiltersProps {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  specialty: string;
  setSpecialty: (value: string) => void;
  location: string;
  setLocation: (value: string) => void;
  maxPrice: number;
  setMaxPrice: (value: number) => void;
}

const specialties = [
  "All Specialties",
  "Cardiology",
  "Pediatrics",
  "Dermatology",
  "Orthopedics",
  "Gynecology",
  "Neurology",
];

const locations = [
  "All Locations",
  "Beirut",
  "Tripoli",
  "Sidon",
  "Zahle",
  "Tyre",
];

const DoctorFilters = ({
  searchQuery,
  setSearchQuery,
  specialty,
  setSpecialty,
  location,
  setLocation,
  maxPrice,
  setMaxPrice,
}: DoctorFiltersProps) => {
  // Local state for temporary filter values
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);
  const [localSpecialty, setLocalSpecialty] = useState(specialty);
  const [localLocation, setLocalLocation] = useState(location);
  const [localMaxPrice, setLocalMaxPrice] = useState(maxPrice);

  const handleApplyFilters = () => {
    setSearchQuery(localSearchQuery);
    setSpecialty(localSpecialty);
    setLocation(localLocation);
    setMaxPrice(localMaxPrice);
  };

  const handleResetFilters = () => {
    const defaultValues = {
      searchQuery: "",
      specialty: "All Specialties",
      location: "All Locations",
      maxPrice: 100,
    };

    setLocalSearchQuery(defaultValues.searchQuery);
    setLocalSpecialty(defaultValues.specialty);
    setLocalLocation(defaultValues.location);
    setLocalMaxPrice(defaultValues.maxPrice);

    setSearchQuery(defaultValues.searchQuery);
    setSpecialty(defaultValues.specialty);
    setLocation(defaultValues.location);
    setMaxPrice(defaultValues.maxPrice);
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
              placeholder="Search by name or specialty..."
              value={localSearchQuery}
              onChange={(e) => setLocalSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="specialty" className="mb-2 block">Specialty</Label>
          <Select value={localSpecialty} onValueChange={setLocalSpecialty}>
            <SelectTrigger id="specialty">
              <SelectValue placeholder="Select specialty" />
            </SelectTrigger>
            <SelectContent className="bg-background z-50">
              {specialties.map((spec) => (
                <SelectItem key={spec} value={spec}>
                  {spec}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
          <Label className="mb-2 block">
            Max Price: ${localMaxPrice}
          </Label>
          <Slider
            value={[localMaxPrice]}
            onValueChange={(values) => setLocalMaxPrice(values[0])}
            min={0}
            max={100}
            step={5}
            className="mt-2"
          />
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

export default DoctorFilters;
