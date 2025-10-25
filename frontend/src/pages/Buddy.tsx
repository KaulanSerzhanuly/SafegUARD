import { useState } from "react";
import { ArrowLeft, Users, Plus, Clock, MapPin, CheckCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { showSuccess, showError } from "@/utils/toast";
import { Badge } from "@/components/ui/badge";

interface Participant {
  id: string;
  name: string;
  phone: string;
}

const Buddy = () => {
  const navigate = useNavigate();
  const [participants, setParticipants] = useState<Participant[]>([
    { id: "1", name: "", phone: "" }
  ]);
  const [checkInInterval, setCheckInInterval] = useState("15");
  const [destination, setDestination] = useState("");
  const [activeSessions, setActiveSessions] = useState<any[]>([]);

  const addParticipant = () => {
    setParticipants([
      ...participants,
      { id: Date.now().toString(), name: "", phone: "" }
    ]);
  };

  const removeParticipant = (id: string) => {
    if (participants.length > 1) {
      setParticipants(participants.filter(p => p.id !== id));
    }
  };

  const updateParticipant = (id: string, field: "name" | "phone", value: string) => {
    setParticipants(participants.map(p => 
      p.id === id ? { ...p, [field]: value } : p
    ));
  };

  const handleCreateSession = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate minimum 2 participants
    const validParticipants = participants.filter(p => p.name && p.phone);
    if (validParticipants.length < 2) {
      showError("Buddy system requires at least 2 participants");
      return;
    }

    // Create session
    const sessions = JSON.parse(localStorage.getItem("buddySessions") || "[]");
    const newSession = {
      id: Date.now().toString(),
      participants: validParticipants,
      checkInInterval: parseInt(checkInInterval),
      destination,
      status: "active",
      createdAt: new Date().toISOString(),
      lastCheckIn: new Date().toISOString()
    };
    
    sessions.push(newSession);
    localStorage.setItem("buddySessions", JSON.stringify(sessions));
    
    showSuccess("Buddy session created! Stay safe together.");
    
    // Reset form
    setParticipants([{ id: "1", name: "", phone: "" }]);
    setDestination("");
    loadActiveSessions();
  };

  const loadActiveSessions = () => {
    const sessions = JSON.parse(localStorage.getItem("buddySessions") || "[]");
    setActiveSessions(sessions.filter((s: any) => s.status === "active"));
  };

  const handleCheckIn = (sessionId: string) => {
    const sessions = JSON.parse(localStorage.getItem("buddySessions") || "[]");
    const updatedSessions = sessions.map((s: any) => 
      s.id === sessionId 
        ? { ...s, lastCheckIn: new Date().toISOString() }
        : s
    );
    localStorage.setItem("buddySessions", JSON.stringify(updatedSessions));
    showSuccess("Check-in recorded!");
    loadActiveSessions();
  };

  const handleEndSession = (sessionId: string) => {
    const sessions = JSON.parse(localStorage.getItem("buddySessions") || "[]");
    const updatedSessions = sessions.map((s: any) => 
      s.id === sessionId 
        ? { ...s, status: "completed", endedAt: new Date().toISOString() }
        : s
    );
    localStorage.setItem("buddySessions", JSON.stringify(updatedSessions));
    showSuccess("Buddy session ended. Glad you're safe!");
    loadActiveSessions();
  };

  useState(() => {
    loadActiveSessions();
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <Users className="w-6 h-6 text-purple-600" />
            <div>
              <h1 className="text-xl font-bold text-gray-900">Buddy System</h1>
              <p className="text-xs text-gray-600">Walk together, stay safe</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Info Card */}
        <Card className="mb-6 border-purple-200 bg-purple-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Users className="w-5 h-5 text-purple-600 mt-1" />
              <div>
                <p className="font-semibold text-purple-900 mb-1">How Buddy System Works</p>
                <p className="text-sm text-purple-700">
                  Create a group with friends walking the same route. Set check-in intervals to ensure everyone stays safe. 
                  If someone misses a check-in, all participants are notified.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Active Sessions */}
        {activeSessions.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Active Sessions</h2>
            <div className="space-y-4">
              {activeSessions.map((session) => (
                <Card key={session.id} className="border-green-200">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-base flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                          Active Buddy Session
                        </CardTitle>
                        <CardDescription className="mt-1">
                          <MapPin className="w-3 h-3 inline mr-1" />
                          {session.destination}
                        </CardDescription>
                      </div>
                      <Badge className="bg-green-600">Active</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-2">Participants:</p>
                        <div className="flex flex-wrap gap-2">
                          {session.participants.map((p: Participant) => (
                            <Badge key={p.id} variant="outline">
                              {p.name}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Clock className="w-4 h-4" />
                        <span>Check-in every {session.checkInInterval} minutes</span>
                      </div>
                      
                      <div className="text-xs text-gray-500">
                        Last check-in: {new Date(session.lastCheckIn).toLocaleTimeString()}
                      </div>
                      
                      <div className="flex gap-2 pt-2">
                        <Button 
                          onClick={() => handleCheckIn(session.id)}
                          className="flex-1"
                          size="sm"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Check In
                        </Button>
                        <Button 
                          onClick={() => handleEndSession(session.id)}
                          variant="outline"
                          size="sm"
                          className="flex-1"
                        >
                          End Session
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Create Session Form */}
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Create Buddy Session</CardTitle>
            <CardDescription>
              Add at least 2 participants to start a buddy session
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateSession} className="space-y-6">
              {/* Destination */}
              <div className="space-y-2">
                <Label htmlFor="destination">Destination *</Label>
                <Input
                  id="destination"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder="e.g., Student Union, 7th Street Garage"
                  required
                />
              </div>

              {/* Check-in Interval */}
              <div className="space-y-2">
                <Label htmlFor="interval">Check-in Interval *</Label>
                <Select
                  value={checkInInterval}
                  onValueChange={setCheckInInterval}
                  required
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">Every 5 minutes</SelectItem>
                    <SelectItem value="10">Every 10 minutes</SelectItem>
                    <SelectItem value="15">Every 15 minutes</SelectItem>
                    <SelectItem value="30">Every 30 minutes</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Participants */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Participants (minimum 2) *</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addParticipant}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Participant
                  </Button>
                </div>

                {participants.map((participant, index) => (
                  <Card key={participant.id} className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex-1 space-y-3">
                        <Input
                          placeholder="Name"
                          value={participant.name}
                          onChange={(e) => updateParticipant(participant.id, "name", e.target.value)}
                          required
                        />
                        <Input
                          placeholder="Phone number"
                          type="tel"
                          value={participant.phone}
                          onChange={(e) => updateParticipant(participant.id, "phone", e.target.value)}
                          required
                        />
                      </div>
                      {participants.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeParticipant(participant.id)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </Card>
                ))}
              </div>

              {/* Submit Button */}
              <div className="flex gap-3">
                <Button type="button" variant="outline" onClick={() => navigate("/")} className="flex-1">
                  Cancel
                </Button>
                <Button type="submit" className="flex-1 bg-purple-600 hover:bg-purple-700">
                  <Users className="w-4 h-4 mr-2" />
                  Start Buddy Session
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Safety Tips */}
        <Card className="max-w-2xl mx-auto mt-6 bg-gray-50">
          <CardHeader>
            <CardTitle className="text-base">Buddy System Tips</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-purple-600 mt-1">•</span>
                <span>Always walk in well-lit areas and stick together</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-600 mt-1">•</span>
                <span>Check in at the scheduled intervals to confirm everyone is safe</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-600 mt-1">•</span>
                <span>If someone misses a check-in, contact them immediately</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-600 mt-1">•</span>
                <span>Share your session details with a trusted contact not in the group</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Buddy;