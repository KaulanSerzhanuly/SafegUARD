import { useState } from "react";
import { ArrowLeft, AlertTriangle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { showSuccess } from "@/utils/toast";
import { Slider } from "@/components/ui/slider";

const Report = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    type: "",
    location: "",
    description: "",
    severity: 3,
    anonymous: false
  });

  const incidentTypes = [
    { value: "theft", label: "Theft" },
    { value: "assault", label: "Assault" },
    { value: "harassment", label: "Harassment" },
    { value: "suspicious", label: "Suspicious Activity" },
    { value: "vandalism", label: "Vandalism" },
    { value: "lighting", label: "Poor Lighting" },
    { value: "facility", label: "Facility Issue" },
    { value: "emergency_phone", label: "Emergency Phone Issue" },
    { value: "other", label: "Other" }
  ];

  const sjsuLocations = [
    "Dr. MLK Jr. Library",
    "Student Union",
    "Tower Hall",
    "Duncan Hall",
    "Engineering Building",
    "Yoshihiro Uchida Hall",
    "Event Center",
    "South Campus",
    "7th Street Garage",
    "4th Street Garage",
    "10th Street Garage",
    "Spartan Complex",
    "Campus Village",
    "Joe West Hall",
    "Paseo de San Carlos",
    "Tower Lawn",
    "Other"
  ];

  const severityLabels = [
    "Very Low",
    "Low",
    "Moderate",
    "High",
    "Critical"
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Save to localStorage
    const reports = JSON.parse(localStorage.getItem("safetyReports") || "[]");
    const newReport = {
      ...formData,
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      status: "submitted"
    };
    reports.push(newReport);
    localStorage.setItem("safetyReports", JSON.stringify(reports));
    
    showSuccess("Report submitted successfully. UPD has been notified.");
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <AlertTriangle className="w-6 h-6 text-orange-600" />
            <div>
              <h1 className="text-xl font-bold text-gray-900">Report Incident</h1>
              <p className="text-xs text-gray-600">Help keep SJSU safe</p>
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Incident Details</CardTitle>
            <CardDescription>
              Your report helps UPD identify and address safety concerns on campus. All reports are reviewed by University Police.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Incident Type */}
              <div className="space-y-2">
                <Label htmlFor="type">Incident Type *</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => setFormData({ ...formData, type: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select incident type" />
                  </SelectTrigger>
                  <SelectContent>
                    {incidentTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Severity Level */}
              <div className="space-y-3">
                <Label>Severity Level: {severityLabels[formData.severity - 1]} ({formData.severity}/5)</Label>
                <Slider
                  value={[formData.severity]}
                  onValueChange={(value) => setFormData({ ...formData, severity: value[0] })}
                  min={1}
                  max={5}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Very Low</span>
                  <span>Low</span>
                  <span>Moderate</span>
                  <span>High</span>
                  <span>Critical</span>
                </div>
              </div>

              {/* Location */}
              <div className="space-y-2">
                <Label htmlFor="location">Location *</Label>
                <Select
                  value={formData.location}
                  onValueChange={(value) => setFormData({ ...formData, location: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select campus location" />
                  </SelectTrigger>
                  <SelectContent>
                    {sjsuLocations.map((location) => (
                      <SelectItem key={location} value={location}>
                        {location}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Please provide details about what you observed..."
                  rows={5}
                  required
                />
              </div>

              {/* Time Info */}
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="pt-4">
                  <div className="flex items-center gap-2 text-sm text-blue-900">
                    <Clock className="w-4 h-4" />
                    <span>Timestamp: {new Date().toLocaleString()}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Anonymous Option */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="anonymous"
                  checked={formData.anonymous}
                  onChange={(e) => setFormData({ ...formData, anonymous: e.target.checked })}
                  className="w-4 h-4"
                />
                <Label htmlFor="anonymous" className="cursor-pointer">
                  Submit anonymously
                </Label>
              </div>

              {/* Submit Button */}
              <div className="flex gap-3">
                <Button type="button" variant="outline" onClick={() => navigate("/")} className="flex-1">
                  Cancel
                </Button>
                <Button type="submit" className="flex-1 bg-orange-600 hover:bg-orange-700">
                  Submit Report
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Privacy Notice */}
        <Card className="max-w-2xl mx-auto mt-6 bg-gray-50">
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600">
              <strong>Privacy Notice:</strong> Your report will be reviewed by SJSU University Police Department (UPD). 
              If you choose to submit anonymously, your identity will not be shared. 
              For emergencies, please call 911 or UPD at (408) 924-2222.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Report;