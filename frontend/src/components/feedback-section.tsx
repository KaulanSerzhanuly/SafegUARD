import { Card, CardContent } from "@/components/ui/card";
import { MessageSquare } from "lucide-react";

interface Review {
  id: string;
  name: string;
  date: string;
  comment: string;
}

export const FeedbackSection = () => {
  const reviews: Review[] = [
    {
      id: "1",
      name: "Sarah M.",
      date: "2 days ago",
      comment: "Used the buddy system feature last night walking from the library to my car. Felt much safer knowing my roommate could track my route. Great app!"
    },
    {
      id: "2",
      name: "James K.",
      date: "1 week ago",
      comment: "The safe routes feature is really helpful. I didn't know about some of the better-lit paths around campus. Definitely using this regularly now."
    },
    {
      id: "3",
      name: "Maria L.",
      date: "2 weeks ago",
      comment: "Reported a broken emergency phone through the app and UPD responded quickly. Nice to have everything in one place."
    }
  ];

  return (
    <div className="mt-12 mb-8">
      <div className="flex items-center gap-2 mb-6">
        <MessageSquare className="w-5 h-5 text-gray-600" />
        <h2 className="text-lg font-semibold text-gray-900">What Spartans Are Saying</h2>
      </div>
      
      <div className="space-y-4">
        {reviews.map((review) => (
          <Card key={review.id} className="bg-white">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between mb-2">
                <p className="font-medium text-gray-900">{review.name}</p>
                <p className="text-xs text-gray-500">{review.date}</p>
              </div>
              <p className="text-sm text-gray-700">{review.comment}</p>
            </CardContent>
          </Card>
        ))}
        
        {/* Placeholder for future reviews */}
        <Card className="bg-gray-50 border-dashed">
          <CardContent className="pt-6">
            <p className="text-sm text-gray-500 text-center italic">
              Your feedback helps make SJSU safer. Share your experience with SafeGuard.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};