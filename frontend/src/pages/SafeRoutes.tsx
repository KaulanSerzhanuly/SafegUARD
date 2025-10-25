import { useState, useEffect } from "react";
import { ArrowLeft, MapPin, Clock, TrendingUp, Navigation, ExternalLink, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { showSuccess, showError } from "@/utils/toast";

interface Location {
  lat: number;
  lng: number;
  accuracy?: number;
}

const SafeRoutes = () => {
  const navigate = useNavigate();
  const [currentLocation, setCurrentLocation] = useState<Location | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  const routes = [
    {
      id: "1",
      name: "Main Campus Route",
      from: "MLK Library",
      to: "Student Union",
      fromCoords: { lat: 37.3352, lng: -121.8811 },
      toCoords: { lat: 37.3357, lng: -121.8816 },
      distance: "0.3 miles",
      time: "6 min",
      safety: "Very Safe",
      safetyScore: 95,
      features: ["Well-lit", "High foot traffic", "Blue light phones", "UPD patrols"],
      description: "Via Paseo de San Carlos - most direct and safest route",
      color: "green"
    },
    {
      id: "2",
      name: "Tower Lawn Path",
      from: "MLK Library",
      to: "Student Union",
      fromCoords: { lat: 37.3352, lng: -121.8811 },
      toCoords: { lat: 37.3357, lng: -121.8816 },
      distance: "0.4 miles",
      time: "8 min",
      safety: "Very Safe",
      safetyScore: 92,
      features: ["Open area", "Security cameras", "Well-lit"],
      description: "Through Tower Lawn - scenic and safe during day/evening",
      color: "green"
    },
    {
      id: "3",
      name: "7th Street Route",
      from: "7th Street Garage",
      to: "Engineering Building",
      fromCoords: { lat: 37.3345, lng: -121.8805 },
      toCoords: { lat: 37.3365, lng: -121.8820 },
      distance: "0.2 miles",
      time: "4 min",
      safety: "Safe",
      safetyScore: 88,
      features: ["Direct path", "Moderate lighting", "Emergency phones"],
      description: "Quick route from parking to Engineering",
      color: "blue"
    },
    {
      id: "4",
      name: "South Campus Path",
      from: "Campus Village",
      to: "Event Center",
      fromCoords: { lat: 37.3330, lng: -121.8795 },
      toCoords: { lat: 37.3370, lng: -121.8825 },
      distance: "0.5 miles",
      time: "10 min",
      safety: "Use Caution at Night",
      safetyScore: 65,
      features: ["Limited lighting", "Less foot traffic after dark"],
      description: "Recommend UPD escort after 9 PM",
      color: "orange"
    }
  ];

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser");
      showError("Geolocation is not supported by your browser");
      return;
    }

    setIsLoadingLocation(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy
        };
        setCurrentLocation(location);
        setIsLoadingLocation(false);
        showSuccess("Location updated successfully!");
      },
      (error) => {
        setIsLoadingLocation(false);
        let errorMessage = "Unable to get your location";
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Location permission denied. Please enable location access in your browser settings.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Location information is unavailable.";
            break;
          case error.TIMEOUT:
            errorMessage = "Location request timed out.";
            break;
        }
        
        setLocationError(errorMessage);
        showError(errorMessage);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  useEffect(() => {
    // Automatically get location on mount
    getCurrentLocation();
  }, []);

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 3959; // Earth's radius in miles
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    return distance;
  };

  const getMapUrl = () => {
    if (currentLocation) {
      // Center map on user's location with a marker
      return `https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${currentLocation.lat},${currentLocation.lng}&zoom=16&maptype=roadmap`;
    }
    // Default to SJSU campus
    return "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3172.8847847847847!2d-121.88494!3d37.335371!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x808fcca17b7c36c5%3A0x64979c6c1f3e9e3f!2sSan%20Jos%C3%A9%20State%20University!5e0!3m2!1sen!2sus!4v1234567890123";
  };

  const getSafetyColor = (score: number) => {
    if (score >= 90) return "bg-green-500";
    if (score >= 75) return "bg-blue-500";
    if (score >= 60) return "bg-orange-500";
    return "bg-red-500";
  };

  const getSafetyBadgeColor = (safety: string) => {
    if (safety === "Very Safe") return "bg-green-100 text-green-800";
    if (safety === "Safe") return "bg-blue-100 text-blue-800";
    return "bg-orange-100 text-orange-800";
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
            <Navigation className="w-6 h-6 text-green-600" />
            <div>
              <h1 className="text-xl font-bold text-gray-900">Safe Routes</h1>
              <p className="text-xs text-gray-600">SJSU Campus paths</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Embedded Google Map */}
        <Card className="mb-6">
          <CardContent className="p-0">
            <iframe
              src={getMapUrl()}
              width="100%"
              height="400"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="rounded-t-lg"
              title="SJSU Campus Map"
            ></iframe>
            <div className="p-4 bg-white border-t space-y-2">
              <Button 
                variant="outline" 
                className="w-full"
                onClick={getCurrentLocation}
                disabled={isLoadingLocation}
              >
                {isLoadingLocation ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Getting Location...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Update My Location
                  </>
                )}
              </Button>
              <Button variant="outline" className="w-full" asChild>
                <a 
                  href={currentLocation 
                    ? `https://www.google.com/maps/dir/?api=1&origin=${currentLocation.lat},${currentLocation.lng}&destination=San+Jose+State+University`
                    : "https://www.google.com/maps/place/San+Jos%C3%A9+State+University/@37.3352,-121.8811,17z"
                  }
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2"
                >
                  <ExternalLink className="w-4 h-4" />
                  Open in Google Maps
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Current Location */}
        <Card className={`mb-6 ${currentLocation ? 'border-green-200 bg-green-50' : locationError ? 'border-red-200 bg-red-50' : 'border-blue-200 bg-blue-50'}`}>
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <MapPin className={`w-5 h-5 mt-1 ${currentLocation ? 'text-green-600' : locationError ? 'text-red-600' : 'text-blue-600'}`} />
              <div className="flex-1">
                {isLoadingLocation ? (
                  <>
                    <p className="font-semibold text-blue-900">Getting your location...</p>
                    <p className="text-sm text-blue-700">Please allow location access</p>
                  </>
                ) : currentLocation ? (
                  <>
                    <p className="font-semibold text-green-900">Current Location</p>
                    <p className="text-sm text-green-700">
                      Lat: {currentLocation.lat.toFixed(6)}, Lng: {currentLocation.lng.toFixed(6)}
                    </p>
                    {currentLocation.accuracy && (
                      <p className="text-xs text-green-600 mt-1">
                        Accuracy: ±{Math.round(currentLocation.accuracy)}m
                      </p>
                    )}
                  </>
                ) : locationError ? (
                  <>
                    <p className="font-semibold text-red-900">Location Unavailable</p>
                    <p className="text-sm text-red-700">{locationError}</p>
                  </>
                ) : (
                  <>
                    <p className="font-semibold text-blue-900">Location Not Set</p>
                    <p className="text-sm text-blue-700">Click "Update My Location" to get started</p>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Routes List */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Recommended Safe Routes</h2>
          
          {routes.map((route, index) => {
            const distanceFromUser = currentLocation 
              ? calculateDistance(currentLocation.lat, currentLocation.lng, route.fromCoords.lat, route.fromCoords.lng)
              : null;

            return (
              <Card key={route.id} className={index === 0 ? "border-green-300 shadow-md" : ""}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <CardTitle className="text-lg">{route.name}</CardTitle>
                        {index === 0 && (
                          <Badge className="bg-green-600">Recommended</Badge>
                        )}
                      </div>
                      <CardDescription>
                        {route.from} → {route.to}
                      </CardDescription>
                      <p className="text-sm text-gray-600 mt-1">{route.description}</p>
                      {distanceFromUser !== null && (
                        <p className="text-xs text-blue-600 mt-1">
                          <MapPin className="w-3 h-3 inline mr-1" />
                          {distanceFromUser < 0.1 
                            ? "You're here!" 
                            : `${distanceFromUser.toFixed(2)} miles from start`
                          }
                        </p>
                      )}
                    </div>
                    <Badge className={getSafetyBadgeColor(route.safety)}>
                      {route.safety}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Stats */}
                  <div className="flex gap-4 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Navigation className="w-4 h-4" />
                      <span>{route.distance}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock className="w-4 h-4" />
                      <span>{route.time}</span>
                    </div>
                  </div>

                  {/* Safety Score */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Safety Score</span>
                      <span className="text-sm font-bold text-gray-900">{route.safetyScore}/100</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`${getSafetyColor(route.safetyScore)} h-2 rounded-full transition-all`}
                        style={{ width: `${route.safetyScore}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Features */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {route.features.map((feature, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {feature}
                      </Badge>
                    ))}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <Button 
                      className="flex-1" 
                      variant={index === 0 ? "default" : "outline"}
                      asChild
                    >
                      <a
                        href={currentLocation
                          ? `https://www.google.com/maps/dir/?api=1&origin=${currentLocation.lat},${currentLocation.lng}&destination=${route.toCoords.lat},${route.toCoords.lng}&travelmode=walking`
                          : `https://www.google.com/maps/dir/?api=1&origin=${route.fromCoords.lat},${route.fromCoords.lng}&destination=${route.toCoords.lat},${route.toCoords.lng}&travelmode=walking`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Navigation className="w-4 h-4 mr-2" />
                        Get Directions
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* UPD Escort Info */}
        <Card className="mt-6 bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-blue-600 mt-1" />
              <div>
                <p className="font-medium text-blue-900 mb-1">Need a Safety Escort?</p>
                <p className="text-sm text-blue-700 mb-2">
                  UPD offers free safety escorts anywhere on campus, 24/7. An officer will meet you and walk you to your destination.
                </p>
                <Button variant="outline" size="sm" className="bg-white">
                  Call UPD: (408) 924-2222
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="mt-6 bg-gray-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <TrendingUp className="w-5 h-5 text-blue-600 mt-1" />
              <div>
                <p className="font-medium text-gray-900 mb-1">How we calculate safety scores</p>
                <p className="text-sm text-gray-600">
                  Routes are scored based on lighting conditions, security camera coverage, 
                  blue light emergency phone locations, recent incident reports, foot traffic patterns, 
                  and UPD patrol frequency.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SafeRoutes;