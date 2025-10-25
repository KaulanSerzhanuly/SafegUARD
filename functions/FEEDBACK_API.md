# Feedback & Review System API Documentation

## Overview
The Feedback API provides a comprehensive system for collecting, managing, and displaying user feedback, reviews, and ratings for the SafeGuard SJSU application. It includes features for voting, reporting, admin moderation, and detailed app ratings.

## Base URL
```
/api/feedback
```

## Endpoints

### 1. Submit Feedback
**POST** `/api/feedback`

Submit new feedback or review for the app.

**Request Body:**
```json
{
  "uid": "user123",
  "rating": 5,
  "comment": "This app has made me feel so much safer on campus. The buddy system is amazing!",
  "category": "feature",
  "userName": "Sarah M.",
  "isAnonymous": false,
  "featureRatings": {
    "buddySystem": 5,
    "safeRoutes": 4,
    "incidentReporting": 5,
    "aiAssistant": 4,
    "alerts": 5
  }
}
```

**Parameters:**
- `uid` (string, optional): User ID (defaults to "anonymous")
- `rating` (number, required): Overall rating (1-5)
- `comment` (string, required): Feedback text (10-1000 characters)
- `category` (string, required): Category ("app", "feature", "safety", "support", "general")
- `userName` (string, optional): Display name (1-100 characters)
- `isAnonymous` (boolean, optional): Submit anonymously (default: false)
- `featureRatings` (object, optional): Individual feature ratings (1-5 each)
  - `buddySystem` (number, optional)
  - `safeRoutes` (number, optional)
  - `incidentReporting` (number, optional)
  - `aiAssistant` (number, optional)
  - `alerts` (number, optional)

**Response:**
```json
{
  "success": true,
  "feedbackId": "feedback_abc123",
  "status": "pending"
}
```

**Status Values:**
- `pending`: Awaiting admin review
- `flagged`: Automatically flagged for review (contains inappropriate content)

---

### 2. Get All Feedback
**GET** `/api/feedback`

Retrieve all approved feedback (public endpoint).

**Query Parameters:**
- `category` (string, optional): Filter by category
- `minRating` (number, optional): Minimum rating filter (1-5)
- `limit` (number, optional): Results per page (default: 20)
- `sortBy` (string, optional): Sort order ("recent", "rating", "helpful")
- `page` (number, optional): Page number (default: 1)

**Example:**
```
GET /api/feedback?category=feature&minRating=4&sortBy=helpful&limit=10&page=1
```

**Response:**
```json
{
  "feedbacks": [
    {
      "id": "feedback_1",
      "userName": "Sarah M.",
      "rating": 5,
      "comment": "This app has made me feel so much safer on campus...",
      "category": "feature",
      "featureRatings": {
        "buddySystem": 5,
        "safeRoutes": 4
      },
      "createdAt": "2025-10-25T08:00:00.000Z",
      "helpful": 15,
      "notHelpful": 2,
      "adminResponse": "Thank you for your feedback! We're glad you're enjoying the buddy system."
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 45,
    "totalPages": 5
  }
}
```

---

### 3. Get Specific Feedback
**GET** `/api/feedback/:id`

Retrieve a specific feedback by ID.

**Parameters:**
- `id` (string, required): Feedback ID

**Response:**
```json
{
  "id": "feedback_1",
  "userName": "Sarah M.",
  "rating": 5,
  "comment": "This app has made me feel so much safer on campus...",
  "category": "feature",
  "featureRatings": {
    "buddySystem": 5,
    "safeRoutes": 4
  },
  "createdAt": "2025-10-25T08:00:00.000Z",
  "helpful": 15,
  "notHelpful": 2,
  "adminResponse": "Thank you for your feedback!",
  "adminResponseAt": "2025-10-25T09:00:00.000Z"
}
```

---

### 4. Vote on Feedback
**POST** `/api/feedback/vote`

Vote on whether feedback is helpful or not.

**Request Body:**
```json
{
  "uid": "user123",
  "feedbackId": "feedback_abc123",
  "vote": "helpful"
}
```

**Parameters:**
- `uid` (string, optional): User ID
- `feedbackId` (string, required): Feedback ID to vote on
- `vote` (string, required): Vote type ("helpful" or "not_helpful")

**Response:**
```json
{
  "success": true,
  "voteId": "vote_xyz789"
}
```

**Error Response:**
```json
{
  "error": "You have already voted on this feedback"
}
```

---

### 5. Report Feedback
**POST** `/api/feedback/report`

Report inappropriate or problematic feedback.

**Request Body:**
```json
{
  "uid": "user123",
  "feedbackId": "feedback_abc123",
  "reason": "spam",
  "description": "This appears to be spam content"
}
```

**Parameters:**
- `uid` (string, optional): Reporter's user ID
- `feedbackId` (string, required): Feedback ID to report
- `reason` (string, required): Report reason ("spam", "inappropriate", "offensive", "misleading", "other")
- `description` (string, optional): Additional details (max 500 characters)

**Response:**
```json
{
  "success": true,
  "reportId": "report_xyz789"
}
```

**Note:** Feedback is automatically flagged after 3 reports.

---

### 6. Get Feedback Statistics
**GET** `/api/feedback/stats/summary`

Get overall feedback statistics.

**Response:**
```json
{
  "total": 150,
  "approved": 142,
  "averageRating": 4.35,
  "ratingDistribution": {
    "1": 2,
    "2": 5,
    "3": 18,
    "4": 45,
    "5": 72
  },
  "categoryDistribution": {
    "app": 30,
    "feature": 55,
    "safety": 25,
    "support": 20,
    "general": 12
  }
}
```

---

### 7. Submit App Rating
**POST** `/api/feedback/app-rating`

Submit detailed app rating with feature-specific ratings.

**Request Body:**
```json
{
  "uid": "user123",
  "overallRating": 5,
  "featureRatings": {
    "buddySystem": 5,
    "safeRoutes": 4,
    "incidentReporting": 5,
    "aiAssistant": 4,
    "alerts": 5,
    "userInterface": 5,
    "performance": 4
  },
  "wouldRecommend": true,
  "improvements": "Would love to see integration with campus shuttle tracking"
}
```

**Parameters:**
- `uid` (string, optional): User ID
- `overallRating` (number, required): Overall rating (1-5)
- `featureRatings` (object, required): Individual feature ratings (1-5 each)
  - `buddySystem` (number, required)
  - `safeRoutes` (number, required)
  - `incidentReporting` (number, required)
  - `aiAssistant` (number, required)
  - `alerts` (number, required)
  - `userInterface` (number, required)
  - `performance` (number, required)
- `wouldRecommend` (boolean, required): Would recommend to others
- `improvements` (string, optional): Suggested improvements (max 1000 characters)

**Response:**
```json
{
  "success": true,
  "ratingId": "rating_abc123"
}
```

**Note:** If user already submitted a rating, it will be updated instead of creating a new one.

---

### 8. Get App Rating Statistics
**GET** `/api/feedback/app-rating/stats`

Get aggregated app rating statistics.

**Response:**
```json
{
  "totalRatings": 85,
  "averageOverallRating": 4.52,
  "averageFeatureRatings": {
    "buddySystem": 4.65,
    "safeRoutes": 4.42,
    "incidentReporting": 4.58,
    "aiAssistant": 4.35,
    "alerts": 4.48,
    "userInterface": 4.55,
    "performance": 4.38
  },
  "recommendationRate": 87.5
}
```

---

## Admin Endpoints

### 9. Get Pending Feedback
**GET** `/api/feedback/admin/pending`

Get all feedback awaiting review (admin only).

**Query Parameters:**
- `limit` (number, optional): Maximum results (default: 50)

**Response:**
```json
{
  "feedbacks": [
    {
      "id": "feedback_1",
      "uid": "user123",
      "userName": "John D.",
      "rating": 4,
      "comment": "Great app, but needs some improvements...",
      "category": "app",
      "createdAt": "2025-10-25T08:00:00.000Z",
      "status": "pending",
      "isAnonymous": false,
      "helpful": 0,
      "notHelpful": 0
    }
  ]
}
```

---

### 10. Approve Feedback
**PUT** `/api/feedback/admin/approve/:id`

Approve feedback for public display (admin only).

**Parameters:**
- `id` (string, required): Feedback ID

**Response:**
```json
{
  "success": true
}
```

---

### 11. Reject Feedback
**PUT** `/api/feedback/admin/reject/:id`

Reject feedback (admin only).

**Parameters:**
- `id` (string, required): Feedback ID

**Response:**
```json
{
  "success": true
}
```

---

### 12. Add Admin Response
**POST** `/api/feedback/admin/respond`

Add an admin response to feedback (admin only).

**Request Body:**
```json
{
  "feedbackId": "feedback_abc123",
  "response": "Thank you for your feedback! We're working on implementing this feature."
}
```

**Parameters:**
- `feedbackId` (string, required): Feedback ID
- `response` (string, required): Admin response (1-1000 characters)

**Response:**
```json
{
  "success": true
}
```

---

## Data Models

### Feedback
```typescript
{
  id: string;
  uid: string;
  userName?: string;
  rating: 1 | 2 | 3 | 4 | 5;
  comment: string;
  category: "app" | "feature" | "safety" | "support" | "general";
  featureRatings?: {
    buddySystem?: number;
    safeRoutes?: number;
    incidentReporting?: number;
    aiAssistant?: number;
    alerts?: number;
  };
  createdAt: Timestamp;
  status: "pending" | "approved" | "rejected" | "flagged";
  isAnonymous: boolean;
  helpful: number;
  notHelpful: number;
  adminResponse?: string;
  adminResponseAt?: Timestamp;
}
```

### FeedbackVote
```typescript
{
  id: string;
  feedbackId: string;
  uid: string;
  vote: "helpful" | "not_helpful";
  createdAt: Timestamp;
}
```

### FeedbackReport
```typescript
{
  id: string;
  feedbackId: string;
  reporterUid: string;
  reason: "spam" | "inappropriate" | "offensive" | "misleading" | "other";
  description?: string;
  createdAt: Timestamp;
  status: "pending" | "reviewed" | "resolved";
}
```

### AppRating
```typescript
{
  id: string;
  uid: string;
  overallRating: 1 | 2 | 3 | 4 | 5;
  featureRatings: {
    buddySystem: number;
    safeRoutes: number;
    incidentReporting: number;
    aiAssistant: number;
    alerts: number;
    userInterface: number;
    performance: number;
  };
  wouldRecommend: boolean;
  improvements?: string;
  createdAt: Timestamp;
  updatedAt?: Timestamp;
}
```

---

## Usage Examples

### Frontend Integration

#### Submit Feedback (React/TypeScript)
```typescript
const submitFeedback = async (feedbackData: {
  rating: number;
  comment: string;
  category: string;
  userName?: string;
}) => {
  try {
    const response = await fetch('/api/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        uid: currentUser.uid,
        ...feedbackData,
        isAnonymous: false
      })
    });
    
    const data = await response.json();
    
    if (data.success) {
      showSuccess('Thank you for your feedback!');
    }
  } catch (error) {
    showError('Failed to submit feedback');
  }
};
```

#### Display Feedback with Voting
```typescript
const FeedbackCard = ({ feedback }: { feedback: Feedback }) => {
  const [hasVoted, setHasVoted] = useState(false);
  
  const handleVote = async (vote: 'helpful' | 'not_helpful') => {
    if (hasVoted) return;
    
    try {
      await fetch('/api/feedback/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uid: currentUser.uid,
          feedbackId: feedback.id,
          vote
        })
      });
      
      setHasVoted(true);
      showSuccess('Thank you for your vote!');
    } catch (error) {
      showError('Failed to vote');
    }
  };
  
  return (
    <Card>
      <CardContent>
        <div className="flex items-center gap-2 mb-2">
          <p className="font-semibold">{feedback.userName}</p>
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={i < feedback.rating ? 'fill-yellow-400' : ''}
              />
            ))}
          </div>
        </div>
        <p className="text-gray-700 mb-4">{feedback.comment}</p>
        
        {feedback.adminResponse && (
          <div className="bg-blue-50 p-3 rounded mb-4">
            <p className="text-sm font-semibold text-blue-900">Admin Response:</p>
            <p className="text-sm text-blue-800">{feedback.adminResponse}</p>
          </div>
        )}
        
        <div className="flex items-center gap-4">
          <button
            onClick={() => handleVote('helpful')}
            disabled={hasVoted}
            className="flex items-center gap-1 text-sm"
          >
            <ThumbsUp className="w-4 h-4" />
            Helpful ({feedback.helpful})
          </button>
          <button
            onClick={() => handleVote('not_helpful')}
            disabled={hasVoted}
            className="flex items-center gap-1 text-sm"
          >
            <ThumbsDown className="w-4 h-4" />
            Not Helpful ({feedback.notHelpful})
          </button>
        </div>
      </CardContent>
    </Card>
  );
};
```

#### Submit Detailed App Rating
```typescript
const submitAppRating = async (ratingData: AppRatingData) => {
  try {
    const response = await fetch('/api/feedback/app-rating', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        uid: currentUser.uid,
        ...ratingData
      })
    });
    
    const data = await response.json();
    
    if (data.success) {
      showSuccess('Thank you for rating our app!');
    }
  } catch (error) {
    showError('Failed to submit rating');
  }
};
```

#### Display Feedback Statistics
```typescript
const FeedbackStats = () => {
  const [stats, setStats] = useState(null);
  
  useEffect(() => {
    fetch('/api/feedback/stats/summary')
      .then(res => res.json())
      .then(data => setStats(data));
  }, []);
  
  if (!stats) return <div>Loading...</div>;
  
  return (
    <div className="grid grid-cols-3 gap-4">
      <Card>
        <CardContent className="pt-6 text-center">
          <p className="text-3xl font-bold text-blue-600">
            {stats.averageRating.toFixed(1)}
          </p>
          <p className="text-sm text-gray-600">Average Rating</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="pt-6 text-center">
          <p className="text-3xl font-bold text-green-600">
            {stats.approved}
          </p>
          <p className="text-sm text-gray-600">Total Reviews</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="pt-6 text-center">
          <div className="flex justify-center gap-1">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={i < Math.round(stats.averageRating) ? 'fill-yellow-400' : ''}
              />
            ))}
          </div>
          <p className="text-sm text-gray-600 mt-2">User Satisfaction</p>
        </CardContent>
      </Card>
    </div>
  );
};
```

---

## Security & Moderation

### Content Moderation
1. **Automatic Flagging**: Feedback containing inappropriate words is automatically flagged
2. **Report System**: Users can report problematic feedback
3. **Auto-Flag Threshold**: Feedback is automatically flagged after 3 reports
4. **Admin Review**: All feedback requires admin approval before public display

### Privacy
1. **Anonymous Submissions**: Users can submit feedback anonymously
2. **User Control**: Users can choose to display their name or remain anonymous
3. **Data Protection**: User IDs are not exposed in public endpoints

### Rate Limiting
Recommended rate limits:
- Feedback submission: 3 per hour per user
- Voting: 50 per hour per user
- Reporting: 10 per hour per user

---

## Best Practices

### For Users
1. **Be Specific**: Provide detailed, constructive feedback
2. **Be Respectful**: Keep feedback professional and respectful
3. **Vote Wisely**: Vote on feedback that genuinely helps others
4. **Report Appropriately**: Only report truly problematic content

### For Admins
1. **Review Promptly**: Review pending feedback within 24 hours
2. **Respond Thoughtfully**: Add responses to show users their feedback is valued
3. **Monitor Reports**: Regularly check reported feedback
4. **Track Trends**: Use statistics to identify common issues

### For Developers
1. **Display Prominently**: Show feedback on main pages to encourage submissions
2. **Make It Easy**: Simplify the feedback submission process
3. **Show Appreciation**: Display admin responses to show feedback is valued
4. **Act on Feedback**: Use feedback data to guide development priorities

---

## Testing

Use the provided `example.http` file to test endpoints:

```http
### Submit Feedback
POST http://localhost:5001/api/feedback
Content-Type: application/json

{
  "uid": "test-user",
  "rating": 5,
  "comment": "This app is amazing! The buddy system makes me feel so much safer.",
  "category": "feature",
  "userName": "Test User",
  "isAnonymous": false
}

### Get All Feedback
GET http://localhost:5001/api/feedback?sortBy=helpful&limit=10

### Vote on Feedback
POST http://localhost:5001/api/feedback/vote
Content-Type: application/json

{
  "uid": "test-user",
  "feedbackId": "feedback_123",
  "vote": "helpful"
}

### Get Feedback Stats
GET http://localhost:5001/api/feedback/stats/summary

### Submit App Rating
POST http://localhost:5001/api/feedback/app-rating
Content-Type: application/json

{
  "uid": "test-user",
  "overallRating": 5,
  "featureRatings": {
    "buddySystem": 5,
    "safeRoutes": 4,
    "incidentReporting": 5,
    "aiAssistant": 4,
    "alerts": 5,
    "userInterface": 5,
    "performance": 4
  },
  "wouldRecommend": true,
  "improvements": "Would love dark mode!"
}
```

---

## Error Codes

- `400`: Invalid request data (validation failed)
- `404`: Resource not found (feedback, vote, etc.)
- `500`: Internal server error

---

## Future Enhancements

1. **Sentiment Analysis**: Automatically analyze feedback sentiment
2. **Trending Topics**: Identify common themes in feedback
3. **Email Notifications**: Notify users when admin responds
4. **Feedback Categories**: More granular categorization
5. **Image Attachments**: Allow users to attach screenshots
6. **Feedback Analytics Dashboard**: Comprehensive admin dashboard