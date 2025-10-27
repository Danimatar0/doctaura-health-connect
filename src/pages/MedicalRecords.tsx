import { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import Sidebar from "@/components/Sidebar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  FileText,
  Calendar,
  User,
  Building,
  Activity,
  Syringe,
  FlaskConical,
  Scan,
  FileCheck,
  Download,
  ArrowLeft,
  AlertCircle,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { MedicalRecord } from "@/types";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { medicalRecordsDataService } from "@/services/medicalRecordsDataService";

const MedicalRecords = () => {
  const navigate = useNavigate();

  // State management
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch medical records on component mount
  useEffect(() => {
    const fetchMedicalRecords = async () => {
      try {
        setLoading(true);
        setError(null);

        const recordsData = await medicalRecordsDataService.getMedicalRecords();
        setRecords(recordsData);
      } catch (err) {
        console.error("Error fetching medical records:", err);
        setError("Failed to load medical records. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchMedicalRecords();
  }, []);

  // Helper functions
  const getRecordIcon = (type: MedicalRecord['type']) => {
    switch (type) {
      case 'visit':
        return <Activity className="h-5 w-5" />;
      case 'lab':
        return <FlaskConical className="h-5 w-5" />;
      case 'imaging':
        return <Scan className="h-5 w-5" />;
      case 'vaccination':
        return <Syringe className="h-5 w-5" />;
      case 'procedure':
        return <FileCheck className="h-5 w-5" />;
      default:
        return <FileText className="h-5 w-5" />;
    }
  };

  const getRecordColor = (type: MedicalRecord['type']) => {
    switch (type) {
      case 'visit':
        return 'bg-blue-500/10 text-blue-500';
      case 'lab':
        return 'bg-purple-500/10 text-purple-500';
      case 'imaging':
        return 'bg-green-500/10 text-green-500';
      case 'vaccination':
        return 'bg-orange-500/10 text-orange-500';
      case 'procedure':
        return 'bg-red-500/10 text-red-500';
      default:
        return 'bg-gray-500/10 text-gray-500';
    }
  };

  const getStatusIcon = (status: 'normal' | 'abnormal' | 'critical') => {
    switch (status) {
      case 'normal':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'abnormal':
        return <AlertCircle className="h-4 w-4 text-orange-500" />;
      case 'critical':
        return <XCircle className="h-4 w-4 text-red-500" />;
    }
  };

  const recordsByType = {
    all: records,
    visit: records.filter(r => r.type === 'visit'),
    lab: records.filter(r => r.type === 'lab'),
    imaging: records.filter(r => r.type === 'imaging'),
    vaccination: records.filter(r => r.type === 'vaccination'),
    procedure: records.filter(r => r.type === 'procedure'),
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <Sidebar />
        <main className="flex-1 pt-24 pb-16 pl-64 bg-muted/30 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <p className="mt-4 text-muted-foreground">Loading medical records...</p>
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

  const RecordCard = ({ record }: { record: MedicalRecord }) => (
    <Dialog>
      <DialogTrigger asChild>
        <Card className="shadow-soft hover:shadow-hover transition-smooth cursor-pointer">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${getRecordColor(record.type)}`}>
                {getRecordIcon(record.type)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex-1">
                    <h3 className="font-bold text-lg mb-1">{record.title}</h3>
                    <p className="text-sm text-muted-foreground">{record.doctorName} - {record.specialty}</p>
                  </div>
                  <Badge variant="outline" className="capitalize flex-shrink-0">
                    {record.type}
                  </Badge>
                </div>

                <div className="flex flex-wrap gap-3 text-sm text-muted-foreground mt-3">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>{new Date(record.date).toLocaleDateString()}</span>
                  </div>
                  {record.facility && (
                    <div className="flex items-center gap-1">
                      <Building className="h-4 w-4" />
                      <span>{record.facility}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </DialogTrigger>

      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${getRecordColor(record.type)}`}>
              {getRecordIcon(record.type)}
            </div>
            <div>
              <DialogTitle className="text-2xl">{record.title}</DialogTitle>
              <DialogDescription>
                {new Date(record.date).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-6">
          {/* Basic Info */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="flex items-start gap-3 p-4 bg-muted/30 rounded-lg">
              <User className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Doctor</p>
                <p className="font-semibold">{record.doctorName}</p>
                <p className="text-sm text-muted-foreground">{record.specialty}</p>
              </div>
            </div>

            {record.facility && (
              <div className="flex items-start gap-3 p-4 bg-muted/30 rounded-lg">
                <Building className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Facility</p>
                  <p className="font-semibold">{record.facility}</p>
                </div>
              </div>
            )}
          </div>

          {/* Diagnosis */}
          {record.diagnosis && (
            <div>
              <h3 className="font-semibold text-lg mb-2">Diagnosis</h3>
              <p className="text-muted-foreground bg-muted/30 p-4 rounded-lg">{record.diagnosis}</p>
            </div>
          )}

          {/* Symptoms */}
          {record.symptoms && record.symptoms.length > 0 && (
            <div>
              <h3 className="font-semibold text-lg mb-3">Symptoms</h3>
              <div className="flex flex-wrap gap-2">
                {record.symptoms.map((symptom, index) => (
                  <Badge key={index} variant="secondary">
                    {symptom}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Lab Results */}
          {record.labResults && record.labResults.length > 0 && (
            <div>
              <h3 className="font-semibold text-lg mb-3">Lab Results</h3>
              <div className="space-y-2">
                {record.labResults.map((result, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(result.status)}
                      <div>
                        <p className="font-medium">{result.test}</p>
                        {result.normalRange && (
                          <p className="text-xs text-muted-foreground">Normal: {result.normalRange}</p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{result.result}</p>
                      <p className={`text-xs capitalize ${
                        result.status === 'normal' ? 'text-green-500' :
                        result.status === 'abnormal' ? 'text-orange-500' : 'text-red-500'
                      }`}>
                        {result.status}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Imaging Results */}
          {record.imagingResults && (
            <div>
              <h3 className="font-semibold text-lg mb-3">Imaging Results</h3>
              <div className="bg-muted/30 p-4 rounded-lg">
                <p className="font-medium mb-2">{record.imagingResults.type}</p>
                <p className="text-muted-foreground">{record.imagingResults.findings}</p>
              </div>
            </div>
          )}

          {/* Treatment */}
          {record.treatment && (
            <div>
              <h3 className="font-semibold text-lg mb-2">Treatment</h3>
              <p className="text-muted-foreground bg-muted/30 p-4 rounded-lg">{record.treatment}</p>
            </div>
          )}

          {/* Prescriptions */}
          {record.prescriptions && record.prescriptions.length > 0 && (
            <div>
              <h3 className="font-semibold text-lg mb-3">Prescriptions</h3>
              <div className="space-y-2">
                {record.prescriptions.map((prescription, index) => (
                  <div key={index} className="flex items-center gap-2 p-3 bg-muted/30 rounded-lg">
                    <FileText className="h-4 w-4 text-primary" />
                    <span>{prescription}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Follow Up */}
          {record.followUpDate && (
            <div className="bg-primary/5 border border-primary/20 p-4 rounded-lg">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">Follow-up Scheduled</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(record.followUpDate).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Notes */}
          {record.notes && (
            <div>
              <h3 className="font-semibold text-lg mb-2">Notes</h3>
              <p className="text-muted-foreground bg-muted/30 p-4 rounded-lg italic">{record.notes}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <Sidebar />

      <main className="flex-1 pt-24 pb-16 pl-64 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back Button */}
          <Button
            variant="ghost"
            onClick={() => navigate("/patient-dashboard")}
            className="mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>

          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Medical Records</h1>
            <p className="text-muted-foreground">
              View your complete medical history and health records
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid sm:grid-cols-3 md:grid-cols-5 gap-4 mb-8">
            <Card className="shadow-soft">
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="bg-primary/10 text-primary w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <FileText className="h-6 w-6" />
                  </div>
                  <p className="text-2xl font-bold">{records.length}</p>
                  <p className="text-sm text-muted-foreground">Total Records</p>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-soft">
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="bg-purple-500/10 text-purple-500 w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <FlaskConical className="h-6 w-6" />
                  </div>
                  <p className="text-2xl font-bold">{recordsByType.lab.length}</p>
                  <p className="text-sm text-muted-foreground">Lab Tests</p>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-soft">
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="bg-green-500/10 text-green-500 w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <Scan className="h-6 w-6" />
                  </div>
                  <p className="text-2xl font-bold">{recordsByType.imaging.length}</p>
                  <p className="text-sm text-muted-foreground">Imaging</p>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-soft">
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="bg-blue-500/10 text-blue-500 w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <Activity className="h-6 w-6" />
                  </div>
                  <p className="text-2xl font-bold">{recordsByType.visit.length}</p>
                  <p className="text-sm text-muted-foreground">Visits</p>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-soft">
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="bg-orange-500/10 text-orange-500 w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <Syringe className="h-6 w-6" />
                  </div>
                  <p className="text-2xl font-bold">{recordsByType.vaccination.length}</p>
                  <p className="text-sm text-muted-foreground">Vaccines</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Records List */}
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle>All Medical Records</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="all">
                <TabsList className="mb-6 flex-wrap h-auto">
                  <TabsTrigger value="all">All ({records.length})</TabsTrigger>
                  <TabsTrigger value="visit">Visits ({recordsByType.visit.length})</TabsTrigger>
                  <TabsTrigger value="lab">Lab Tests ({recordsByType.lab.length})</TabsTrigger>
                  <TabsTrigger value="imaging">Imaging ({recordsByType.imaging.length})</TabsTrigger>
                  <TabsTrigger value="vaccination">Vaccines ({recordsByType.vaccination.length})</TabsTrigger>
                  <TabsTrigger value="procedure">Procedures ({recordsByType.procedure.length})</TabsTrigger>
                </TabsList>

                {Object.entries(recordsByType).map(([key, records]) => (
                  <TabsContent key={key} value={key} className="space-y-4">
                    {records.length === 0 ? (
                      <p className="text-center text-muted-foreground py-8">
                        No {key !== 'all' ? key : ''} records found
                      </p>
                    ) : (
                      records.map((record) => (
                        <RecordCard key={record.id} record={record} />
                      ))
                    )}
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default MedicalRecords;
