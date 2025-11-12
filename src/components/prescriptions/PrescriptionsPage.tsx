import { useState, useMemo } from "react";
import Navigation from "@/components/Navigation";
import Sidebar from "@/components/Sidebar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Pill, Filter } from "lucide-react";
import { Prescription } from "@/types";
import PrescriptionCard from "./PrescriptionCard";
import PrescriptionDetailDialog from "./PrescriptionDetailDialog";

interface PrescriptionsPageProps {
  prescriptions: Prescription[];
  loading?: boolean;
  error?: string | null;
  showDoctor?: boolean;
  showPatient?: boolean;
  getPatientName?: (prescription: Prescription) => string;
  pageTitle?: string;
  pageDescription?: string;
}

const PrescriptionsPage = ({
  prescriptions,
  loading = false,
  error = null,
  showDoctor = true,
  showPatient = false,
  getPatientName,
  pageTitle = "My Prescriptions",
  pageDescription = "View and manage all your prescriptions",
}: PrescriptionsPageProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [sortBy, setSortBy] = useState<"date-desc" | "date-asc" | "doctor">("date-desc");
  const [filterDoctor, setFilterDoctor] = useState<string>("all");

  // Get unique doctors for filter
  const doctors = useMemo(() => {
    const uniqueDoctors = new Set(prescriptions.map((p) => p.doctorName));
    return Array.from(uniqueDoctors);
  }, [prescriptions]);

  // Filter and sort prescriptions
  const filteredPrescriptions = useMemo(() => {
    let filtered = prescriptions;

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.doctorName.toLowerCase().includes(query) ||
          p.diagnosis?.toLowerCase().includes(query) ||
          p.medications.some(
            (m) =>
              m.name.toLowerCase().includes(query) ||
              m.instructions?.toLowerCase().includes(query)
          ) ||
          p.notes?.toLowerCase().includes(query)
      );
    }

    // Doctor filter
    if (filterDoctor !== "all") {
      filtered = filtered.filter((p) => p.doctorName === filterDoctor);
    }

    // Sort
    filtered = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case "date-desc":
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        case "date-asc":
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        case "doctor":
          return a.doctorName.localeCompare(b.doctorName);
        default:
          return 0;
      }
    });

    return filtered;
  }, [prescriptions, searchQuery, filterDoctor, sortBy]);

  const handleViewPrescription = (prescription: Prescription) => {
    setSelectedPrescription(prescription);
    setDialogOpen(true);
  };

  // Statistics
  const totalMedications = prescriptions.reduce(
    (acc, p) => acc + p.medications.length,
    0
  );
  const recentPrescriptions = prescriptions.filter((p) => {
    const prescriptionDate = new Date(p.date);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return prescriptionDate >= thirtyDaysAgo;
  }).length;

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <Sidebar />
        <main className="flex-1 pt-24 pb-16 pl-64 bg-muted/30 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <p className="mt-4 text-muted-foreground">Loading prescriptions...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <Sidebar />
        <main className="flex-1 pt-24 pb-16 pl-64 bg-muted/30 flex items-center justify-center">
          <div className="text-center">
            <p className="text-destructive mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>Retry</Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <Sidebar />

      <main className="flex-1 pt-24 pb-16 pl-64 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold">{pageTitle}</h1>
            <p className="text-lg text-muted-foreground mt-2">
              {pageDescription}
            </p>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">
                    {prescriptions.length}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    Total Prescriptions
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">
                    {recentPrescriptions}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    Recent (30 days)
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">
                    {totalMedications}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    Total Medications
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search and Filters */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex flex-col lg:flex-row gap-4">
                {/* Search */}
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by medication, doctor, diagnosis..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>

                {/* Doctor Filter */}
                {showDoctor && doctors.length > 1 && (
                  <Select value={filterDoctor} onValueChange={setFilterDoctor}>
                    <SelectTrigger className="w-full lg:w-[200px]">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="All Doctors" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Doctors</SelectItem>
                      {doctors.map((doctor) => (
                        <SelectItem key={doctor} value={doctor}>
                          {doctor}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}

                {/* Sort */}
                <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                  <SelectTrigger className="w-full lg:w-[180px]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="date-desc">Newest First</SelectItem>
                    <SelectItem value="date-asc">Oldest First</SelectItem>
                    <SelectItem value="doctor">By Doctor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Prescriptions Grid */}
          {filteredPrescriptions.length === 0 ? (
            <Card>
              <CardContent className="py-12">
                <div className="text-center text-muted-foreground">
                  <Pill className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">No prescriptions found</p>
                  <p className="text-sm mt-2">
                    {searchQuery || filterDoctor !== "all"
                      ? "Try adjusting your filters"
                      : "You don't have any prescriptions yet"}
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPrescriptions.map((prescription) => (
                <PrescriptionCard
                  key={prescription.id}
                  prescription={prescription}
                  onView={handleViewPrescription}
                  showDoctor={showDoctor}
                  showPatient={showPatient}
                  patientName={getPatientName?.(prescription)}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />

      {/* Detail Dialog */}
      <PrescriptionDetailDialog
        prescription={selectedPrescription}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        showDoctor={showDoctor}
        showPatient={showPatient}
        patientName={
          selectedPrescription && getPatientName
            ? getPatientName(selectedPrescription)
            : undefined
        }
      />
    </div>
  );
};

export default PrescriptionsPage;
