import { ArrowLeft, Phone, MessageSquare, Users, AlertCircle, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { showSuccess } from "@/utils/toast";

const SOS = () => {
  const navigate = useNavigate();

  const emergencyContacts = [
    {
      name: "Emergency Services",
      number: "911",
      description: "Police, Fire, Medical",
      icon: Phone,
      color: "bg-red-600 hover:bg-red-700"
    },
    {
      name: "SJSU University Police (UPD)",
      number: "(408) 924-2222",
      description: "24/7 Campus Safety & Emergencies",
      icon: Phone,
      color: "bg-blue-600 hover:bg-blue-700"
    },
    {
      name: "UPD Safety Escort",
      number: "(408) 924-2222",
      description: "Free walking escort service",
      icon: Users,
      color: "bg-green-600 hover:bg-green-700"
    },
    {
      name: "Counseling Services",
      number: "(408) 924-5910",
      description: "Mental health support",
      icon: MessageSquare,
      color: "bg-purple-600 hover:bg-purple-700"
    },
    {
      name: "Title IX Office",
      number: "(408) 924-2222",
      description: "Report harassment or discrimination",
      icon: AlertCircle,
      color: "bg-orange-600 hover:bg-orange-700"
    },
    {
      name: "Student Health Center",
      number: "(408) 924-6122",
      description: "Medical assistance",
      icon: Phone,
      color: "bg-teal-600 hover:bg-teal-700"
    }
  ];

  const handleEmergencyCall = (name: string, number: string) => {
    showSuccess(`Calling ${name}: ${number}`);
    // In a real app, this would initiate a phone call
  };

  const handleShareLocation = () => {
    showSuccess("Location shared with emergency contacts");
    // In a real app, this would share GPS coordinates
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <AlertCircle className="w-6 h-6 text-red-600" />
            <div>
              <h1 className="text-xl font-bold text-gray-900">Emergency SOS</h1>
              <p className="text-xs text-gray-600">Quick access to help</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Alert Banner */}
        <Card className="mb-6 border-red-300 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 mt-1" />
              <div>
                <p className="font-semibold text-red-900 mb-1">In immediate danger?</p>
                <p className="text-sm text-red-700">
                  Call 911 immediately or use a blue light emergency phone on campus. This app is not a substitute for emergency services.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Blue Light Phones Info */}
        <Card className="mb-6 border-blue-300 bg-blue-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Phone className="w-5 h-5 text-blue-600 mt-1" />
              <div>
                <p className="font-semibold text-blue-900 mb-1">Blue Light Emergency Phones</p>
                <p className="text-sm text-blue-700">
                  Located throughout SJSU campus. Press the button to connect directly to UPD. Your location is automatically transmitted.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Location Sharing */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Share Your Location
            </CardTitle>
            <CardDescription>
              Let emergency contacts know where you are on campus
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleShareLocation} className="w-full" size="lg">
              <MapPin className="w-4 h-4 mr-2" />
              Share Location Now
            </Button>
          </CardContent>
        </Card>

        {/* Emergency Contacts */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Emergency Contacts</h2>
          
          {emergencyContacts.map((contact) => {
            const Icon = contact.icon;
            return (
              <Card key={contact.number}>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className={`${contact.color} p-3 rounded-lg flex-shrink-0`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900">{contact.name}</h3>
                      <p className="text-sm text-gray-600">{contact.description}</p>
                      <p className="text-lg font-bold text-gray-900 mt-1">{contact.number}</p>
                    </div>
                    <Button
                      onClick={() => handleEmergencyCall(contact.name, contact.number)}
                      className={contact.color}
                      size="lg"
                    >
                      <Phone className="w-4 h-4 mr-2" />
                      Call
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Personal Emergency Contacts */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Personal Emergency Contacts</CardTitle>
            <CardDescription>
              Add trusted contacts who will be notified in emergencies
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full">
              <Users className="w-4 h-4 mr-2" />
              Manage Emergency Contacts
            </Button>
          </CardContent>
        </Card>

        {/* Safety Tips */}
        <Card className="mt-6 bg-gray-50">
          <CardHeader>
            <CardTitle className="text-base">SJSU Safety Tips</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-1">•</span>
                <span>Save UPD's number (408) 924-2222 in your phone</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-1">•</span>
                <span>Use blue light emergency phones - they're located throughout campus</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-1">•</span>
                <span>Request a free UPD safety escort when walking alone at night</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-1">•</span>
                <span>Download the Spartan Safe app for additional safety features</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-1">•</span>
                <span>Trust your instincts - if something feels wrong, seek help immediately</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SOS;