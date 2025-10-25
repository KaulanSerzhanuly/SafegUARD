import { ArrowLeft, Bell, AlertTriangle, Info, CheckCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const Alerts = () => {
  const navigate = useNavigate();

  const alerts = [
    {
      id: "1",
      type: "warning",
      title: "Increased Theft Reports",
      message: "Multiple theft incidents reported near 10th Street Garage this week. Please secure your belongings and use the buddy system after dark.",
      location: "10th Street Garage Area",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      severity: "high",
      status: "active"
    },
    {
      id: "2",
      type: "info",
      title: "Blue Light Phone Maintenance",
      message: "Emergency phone near South Campus will be temporarily offline for maintenance on Friday 3-5 PM. Alternative phones available nearby.",
      location: "South Campus",
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
      severity: "low",
      status: "active"
    },
    {
      id: "3",
      type: "success",
      title: "Suspect Apprehended",
      message: "UPD has apprehended the suspect involved in recent harassment incidents near Duncan Hall. Increased patrols will continue.",
      location: "Duncan Hall",
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      severity: "medium",
      status: "resolved"
    },
    {
      id: "4",
      type: "warning",
      title: "Poor Lighting Reported",
      message: "Several students reported inadequate lighting on the path between Campus Village and Event Center. Facilities has been notified.",
      location: "Campus Village to Event Center",
      timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
      severity: "medium",
      status: "active"
    },
    {
      id: "5",
      type: "info",
      title: "Safety Workshop This Week",
      message: "UPD is hosting a personal safety workshop on Thursday at 6 PM in the Student Union. Learn self-defense basics and safety tips.",
      location: "Student Union",
      timestamp: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(),
      severity: "low",
      status: "active"
    }
  ];

  const getAlertIcon = (type: string) => {
    switch (type) {
      case "warning":
        return <AlertTriangle className="w-5 h-5" />;
      case "success":
        return <CheckCircle className="w-5 h-5" />;
      default:
        return <Info className="w-5 h-5" />;
    }
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case "warning":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "success":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-blue-100 text-blue-800 border-blue-200";
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "high":
        return <Badge className="bg-red-600">High Priority</Badge>;
      case "medium":
        return <Badge className="bg-orange-600">Medium</Badge>;
      default:
        return <Badge className="bg-blue-600">Info</Badge>;
    }
  };

  const getTimeAgo = (timestamp: string) => {
    const now = new Date();
    const then = new Date(timestamp);
    const diffMs = now.getTime() - then.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    } else if (diffHours > 0) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    } else {
      return 'Just now';
    }
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
            <Bell className="w-6 h-6 text-yellow-600" />
            <div>
              <h1 className="text-xl font-bold text-gray-900">Safety Alerts</h1>
              <p className="text-xs text-gray-600">Campus safety notifications</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Summary Card */}
        <Card className="mb-6 border-yellow-200 bg-yellow-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5 text-yellow-600" />
              <div>
                <p className="font-semibold text-yellow-900">
                  {alerts.filter(a => a.status === "active").length} Active Alerts
                </p>
                <p className="text-sm text-yellow-700">Stay informed about campus safety</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Alerts List */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Recent Alerts</h2>
          
          {alerts.map((alert) => (
            <Card key={alert.id} className={getAlertColor(alert.type)}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="mt-1">
                      {getAlertIcon(alert.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <CardTitle className="text-base">{alert.title}</CardTitle>
                        {getSeverityBadge(alert.severity)}
                      </div>
                      <CardDescription className="text-sm">
                        {alert.location}
                      </CardDescription>
                    </div>
                  </div>
                  {alert.status === "resolved" && (
                    <Badge variant="outline" className="bg-white">
                      Resolved
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm mb-3">{alert.message}</p>
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <Clock className="w-3 h-3" />
                  <span>{getTimeAgo(alert.timestamp)}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Info Card */}
        <Card className="mt-6 bg-gray-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-600 mt-1" />
              <div>
                <p className="font-medium text-gray-900 mb-1">About Safety Alerts</p>
                <p className="text-sm text-gray-600">
                  Safety alerts are issued by SJSU University Police Department to keep the campus community 
                  informed about safety concerns, incidents, and important updates. Enable notifications 
                  to receive real-time alerts on your device.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-base">Notification Preferences</CardTitle>
            <CardDescription>
              Customize which alerts you want to receive
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full">
              <Bell className="w-4 h-4 mr-2" />
              Manage Notifications
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Alerts;