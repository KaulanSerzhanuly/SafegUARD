# Live Location API Documentation

## Overview
The Live Location API provides real-time location tracking, location history, buddy session location sharing, and proximity alerts for the SafeGuard SJSU application.

## Base URL
```
/api/location
```

## Endpoints

### 1. Update Location
**POST** `/api/location/update`

Update a user's current location in real-time.

**Request Body:**
```json
{
  "uid": "user123",
  "lat": 37.3352,
  "lng": -121.8811,
  "accuracy": 10,
  "speed": 1.5,
  "heading": 180,
  "sessionId": "buddy-session-123"
}
```

**Parameters:**
- `uid` (string, optional): User ID (defaults to "anonymous")
- `lat` (number, required): Latitude (-90 to 90)
- `lng` (number, required): Longitude (-180 to 180)
- `accuracy` (number, optional): Location accuracy in meters
- `speed` (number, optional): Speed in meters per second
- `heading` (number, optional): Direction in degrees (0-360)
- `sessionId` (string, optional): Buddy session ID if part of a session

**Response:**
```json
{
  "success": true,
  "locationId": "loc_abc123",
  "alerts": [
    {
      "id": "alert_xyz",
      "type": "incident",
      "message": "High risk area nearby",
      "distance": 150
    }
  ]
}
```

---

### 2. Get Current Location
**GET** `/api/location/current/:uid`

Retrieve a user's most recent location.

**Parameters:**
- `uid` (string, required): User ID

**Response:**
```json
{
  "uid": "user123",
  "location": {
    "lat": 37.3352,
    "lng": -121.8811,
    "accuracy": 10
  },
  "lastUpdate": "2025-10-25T08:00:00.000Z"
}
```

---

### 3. Get Location History
**GET** `/api/location/history/:uid`

Retrieve a user's location history.

**Parameters:**
- `uid` (string, required): User ID

**Query Parameters:**
- `startTime` (ISO date string, optional): Start time for history
- `endTime` (ISO date string, optional): End time for history
- `limit` (number, optional): Maximum number of records (default: 100)

**Example:**
```
GET /api/location/history/user123?startTime=2025-10-25T00:00:00Z&limit=50
```

**Response:**
```json
{
  "uid": "user123",
  "count": 50,
  "locations": [
    {
      "id": "loc_1",
      "uid": "user123",
      "location": {
        "lat": 37.3352,
        "lng": -121.8811,
        "accuracy": 10
      },
      "timestamp": "2025-10-25T08:00:00.000Z",
      "speed": 1.5,
      "heading": 180
    }
  ]
}
```

---

### 4. Get Session Locations
**GET** `/api/location/session/:sessionId`

Get all participant locations for a buddy session.

**Parameters:**
- `sessionId` (string, required): Buddy session ID

**Response:**
```json
{
  "sessionId": "buddy-session-123",
  "participants": [
    {
      "uid": "user123",
      "location": {
        "lat": 37.3352,
        "lng": -121.8811
      },
      "timestamp": "2025-10-25T08:00:00.000Z"
    },
    {
      "uid": "user456",
      "location": {
        "lat": 37.3355,
        "lng": -121.8815
      },
      "timestamp": "2025-10-25T08:00:05.000Z"
    }
  ]
}
```

---

### 5. Create Proximity Alert
**POST** `/api/location/proximity-alert`

Create a proximity alert that triggers when the user enters a specific area.

**Request Body:**
```json
{
  "uid": "user123",
  "type": "incident",
  "lat": 37.3352,
  "lng": -121.8811,
  "radius": 500,
  "message": "High risk area - recent theft incidents reported"
}
```

**Parameters:**
- `uid` (string, optional): User ID
- `type` (string, required): Alert type ("incident", "safe_zone", or "buddy")
- `lat` (number, required): Alert center latitude
- `lng` (number, required): Alert center longitude
- `radius` (number, required): Alert radius in meters (1-5000)
- `message` (string, required): Alert message (1-500 characters)

**Response:**
```json
{
  "success": true,
  "alertId": "alert_xyz789"
}
```

---

### 6. Find Nearby Users
**GET** `/api/location/nearby`

Find users near a specific location (useful for buddy system).

**Query Parameters:**
- `lat` (number, required): Search center latitude
- `lng` (number, required): Search center longitude
- `radius` (number, optional): Search radius in meters (default: 1000)

**Example:**
```
GET /api/location/nearby?lat=37.3352&lng=-121.8811&radius=500
```

**Response:**
```json
{
  "count": 3,
  "radius": 500,
  "users": [
    {
      "uid": "user456",
      "location": {
        "lat": 37.3355,
        "lng": -121.8815
      },
      "distance": 45,
      "lastUpdate": "2025-10-25T08:00:00.000Z"
    }
  ]
}
```

---

### 7. Clear Location History
**DELETE** `/api/location/history/:uid`

Delete all location history for a user.

**Parameters:**
- `uid` (string, required): User ID

**Response:**
```json
{
  "success": true,
  "deletedCount": 150
}
```

---

## Data Models

### LocationUpdate
```typescript
{
  id: string;
  uid: string;
  location: {
    lat: number;
    lng: number;
    accuracy?: number;
  };
  timestamp: Timestamp;
  sessionId?: string;
  speed?: number;
  heading?: number;
}
```

### ProximityAlert
```typescript
{
  id: string;
  uid: string;
  type: "incident" | "safe_zone" | "buddy";
  location: {
    lat: number;
    lng: number;
  };
  radius: number;
  message: string;
  createdAt: Timestamp;
  triggered: boolean;
}
```

---

## Usage Examples

### Frontend Integration

#### Update Location (React/TypeScript)
```typescript
const updateLocation = async (position: GeolocationPosition) => {
  try {
    const response = await fetch('/api/location/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        uid: currentUser.uid,
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        accuracy: position.coords.accuracy,
        speed: position.coords.speed,
        heading: position.coords.heading,
        sessionId: activeBuddySession?.id
      })
    });
    
    const data = await response.json();
    
    if (data.alerts && data.alerts.length > 0) {
      // Show proximity alerts to user
      data.alerts.forEach(alert => {
        showNotification(alert.message);
      });
    }
  } catch (error) {
    console.error('Failed to update location:', error);
  }
};

// Start tracking location
navigator.geolocation.watchPosition(
  updateLocation,
  (error) => console.error('Location error:', error),
  { enableHighAccuracy: true, maximumAge: 10000 }
);
```

#### Get Buddy Session Locations
```typescript
const getBuddyLocations = async (sessionId: string) => {
  const response = await fetch(`/api/location/session/${sessionId}`);
  const data = await response.json();
  
  // Update map with participant locations
  data.participants.forEach(participant => {
    updateMarkerOnMap(participant.uid, participant.location);
  });
};

// Poll every 5 seconds for updates
setInterval(() => getBuddyLocations(sessionId), 5000);
```

#### Create Proximity Alert for High-Risk Area
```typescript
const createIncidentAlert = async (incident: Incident) => {
  await fetch('/api/location/proximity-alert', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      uid: currentUser.uid,
      type: 'incident',
      lat: incident.location.lat,
      lng: incident.location.lng,
      radius: 300, // 300 meters
      message: `Caution: ${incident.type} reported nearby`
    })
  });
};
```

---

## Security Considerations

1. **Authentication**: In production, implement proper authentication middleware to verify user identity
2. **Rate Limiting**: Implement rate limiting to prevent abuse (e.g., max 1 update per second)
3. **Privacy**: Users should be able to control who can see their location
4. **Data Retention**: Implement automatic cleanup of old location data (e.g., delete after 30 days)
5. **Encryption**: Use HTTPS for all location data transmission

---

## Performance Tips

1. **Batch Updates**: For buddy sessions, consider batching location updates
2. **Caching**: Cache current locations in memory for faster retrieval
3. **Geohashing**: Use geohashing for efficient proximity queries
4. **Indexing**: Ensure Firestore indexes are created for location queries
5. **Throttling**: Throttle location updates on the client side (e.g., only update if moved > 10 meters)

---

## Error Codes

- `400`: Invalid request data (validation failed)
- `404`: Resource not found (user, session, etc.)
- `500`: Internal server error

---

## Testing

Use the provided `example.http` file to test endpoints:

```http
### Update Location
POST http://localhost:5001/api/location/update
Content-Type: application/json

{
  "uid": "test-user",
  "lat": 37.3352,
  "lng": -121.8811,
  "accuracy": 10
}

### Get Current Location
GET http://localhost:5001/api/location/current/test-user

### Get Location History
GET http://localhost:5001/api/location/history/test-user?limit=10