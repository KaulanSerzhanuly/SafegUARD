import { Shield, MessageSquare, AlertTriangle, Map, Phone, Users, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { FeedbackSection } from "@/components/feedback-section";

const Index = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: MessageSquare,
      title: "Safety Assistant",
      description: "Chat with AI for real-time safety guidance",
      path: "/chat",
      color: "bg-blue-500"
    },
    {
      icon: AlertTriangle,
      title: "Report Incident",
      description: "Log safety concerns with severity levels",
      path: "/report",
      color: "bg-orange-500"
    },
    {
      icon: Users,
      title: "Buddy System",
      description: "Walk together with friends and check-ins",
      path: "/buddy",
      color: "bg-purple-500"
    },
    {
      icon: Map,
      title: "Safe Routes",
      description: "Get recommended safe paths across SJSU",
      path: "/routes",
      color: "bg-green-500"
    },
    {
      icon: Bell,
      title: "Safety Alerts",
      description: "View campus safety notifications",
      path: "/alerts",
      color: "bg-yellow-500"
    },
    {
      icon: Phone,
      title: "Emergency SOS",
      description: "Quick access to UPD and emergency contacts",
      path: "/sos",
      color: "bg-red-500"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Shield className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">SafeGuard SJSU</h1>
              <p className="text-sm text-gray-600">Your San José State Safety Companion</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Quick Status */}
        <Card className="mb-8 border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <div>
                <p className="font-semibold text-green-900">You're in a Safe Zone</p>
                <p className="text-sm text-green-700">Dr. MLK Jr. Library Area - Low Risk</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Feature Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <Card 
                key={feature.path}
                className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => navigate(feature.path)}
              >
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <div className={`${feature.color} p-3 rounded-lg`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-xl mb-2">{feature.title}</CardTitle>
                      <CardDescription>{feature.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            );
          })}
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-3xl font-bold text-blue-600">18</p>
              <p className="text-sm text-gray-600">Safe Routes</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-3xl font-bold text-green-600">2,847</p>
              <p className="text-sm text-gray-600">Active Spartans</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-3xl font-bold text-orange-600">5</p>
              <p className="text-sm text-gray-600">Recent Alerts</p>
            </CardContent>
          </Card>
        </div>

        {/* Feedback Section */}
        <FeedbackSection />
      </div>
    </div>
  );
};

export default Index;