import { useState, useRef, useEffect } from "react";
import { ArrowLeft, Send, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";

interface Message {
  id: string;
  text: string;
  sender: "user" | "assistant";
  timestamp: Date;
}

const Chat = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Hi! I'm your SafeGuard SJSU assistant. I can help you with safe routes around campus, incident reports, or answer safety questions about SJSU. How can I help you today?",
      sender: "assistant",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getAIResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes("route") || lowerMessage.includes("walk") || lowerMessage.includes("get to")) {
      return "I can help you find a safe route on SJSU campus! Popular safe routes include the well-lit path from the MLK Library to Student Union via Paseo de San Carlos, and the route through Tower Lawn. These areas have good lighting, blue light emergency phones, and regular UPD patrols. Where are you trying to go?";
    }
    
    if (lowerMessage.includes("library") || lowerMessage.includes("mlk")) {
      return "The Dr. Martin Luther King Jr. Library is one of the safest areas on campus. It's well-lit, has security cameras, and is open late during the semester. The surrounding Paseo de San Carlos area is also very safe with high foot traffic and emergency call boxes.";
    }
    
    if (lowerMessage.includes("parking") || lowerMessage.includes("garage")) {
      return "SJSU has several parking options. The safest garages at night are the 7th Street Garage (near the library) and the 4th Street Garage. Both have good lighting and security cameras. If you're parking late, consider using the UPD escort service by calling (408) 924-2222.";
    }
    
    if (lowerMessage.includes("student union") || lowerMessage.includes("su")) {
      return "The Student Union is a safe, high-traffic area during the day. At night, stick to well-lit paths like Paseo de San Carlos or 9th Street. There are blue light emergency phones nearby if you need assistance.";
    }
    
    if (lowerMessage.includes("report") || lowerMessage.includes("incident") || lowerMessage.includes("suspicious")) {
      return "Thank you for wanting to report this. Your safety is important. You can file an incident report through this app, or contact UPD directly at (408) 924-2222. For emergencies, always call 911 first. Would you like me to open the incident report form?";
    }
    
    if (lowerMessage.includes("emergency") || lowerMessage.includes("help") || lowerMessage.includes("danger")) {
      return "If you're in immediate danger, please call 911 immediately. For non-emergency campus safety issues, contact UPD at (408) 924-2222. You can also use the blue light emergency phones located throughout campus. Are you safe right now?";
    }
    
    if (lowerMessage.includes("upd") || lowerMessage.includes("police")) {
      return "SJSU University Police Department (UPD) is available 24/7. Emergency: 911 or (408) 924-2222. Non-emergency: (408) 924-2222. UPD also offers free safety escorts anywhere on campus - just call and they'll walk with you!";
    }
    
    if (lowerMessage.includes("escort") || lowerMessage.includes("walk together")) {
      return "Great idea to use the escort service! UPD offers free safety escorts 24/7 anywhere on campus. Just call (408) 924-2222 and an officer will meet you and walk you to your destination. You can also use the Spartan Safe app to request escorts.";
    }
    
    if (lowerMessage.includes("safe") || lowerMessage.includes("area") || lowerMessage.includes("location")) {
      return "The safest areas on SJSU campus are: MLK Library area (very safe, well-lit), Student Union/Tower Lawn (high traffic), and the main academic buildings during class hours. Areas to be more cautious in after dark: South Campus near 10th Street, and the edges of campus. Always use well-lit main paths at night.";
    }
    
    if (lowerMessage.includes("late") || lowerMessage.includes("night") || lowerMessage.includes("dark")) {
      return "If you're on campus late at night, stick to well-lit main paths like Paseo de San Carlos and 9th Street. Use the buddy system when possible, or call UPD for a free safety escort at (408) 924-2222. Blue light emergency phones are located throughout campus if you need immediate help.";
    }
    
    return "I'm here to help keep you safe at SJSU! I can assist with finding safe routes around campus, reporting incidents, connecting you with UPD, or answering safety questions about specific buildings and areas. What would you like to know?";
  };

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: input,
      sender: "user",
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");

    // Simulate AI response delay
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: getAIResponse(input),
        sender: "assistant",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiResponse]);
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSend();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <Shield className="w-6 h-6 text-blue-600" />
            <div>
              <h1 className="text-xl font-bold text-gray-900">Safety Assistant</h1>
              <p className="text-xs text-gray-600">AI-powered SJSU campus guidance</p>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 container mx-auto px-4 py-6 overflow-y-auto">
        <div className="max-w-3xl mx-auto space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              <Card
                className={`max-w-[80%] p-4 ${
                  message.sender === "user"
                    ? "bg-blue-600 text-white"
                    : "bg-white"
                }`}
              >
                <p className="text-sm">{message.text}</p>
                <p className={`text-xs mt-2 ${
                  message.sender === "user" ? "text-blue-100" : "text-gray-500"
                }`}>
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </Card>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="bg-white border-t p-4">
        <div className="container mx-auto max-w-3xl">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask about SJSU safety, routes, or report an incident..."
              className="flex-1"
            />
            <Button onClick={handleSend} size="icon">
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;