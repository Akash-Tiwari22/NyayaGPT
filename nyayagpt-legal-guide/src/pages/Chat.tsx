import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Send, Loader2, Languages, Scale } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const Chat = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [language, setLanguage] = useState<"en" | "hi">("en");

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = { role: "user" as const, content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("legal-chat", {
        body: {
          messages: [...messages, userMessage],
          language,
        },
      });

      if (error) throw error;

      if (data?.response) {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: data.response },
        ]);
      }
    } catch (error: any) {
      console.error("Error:", error);
      toast.error(error.message || "Failed to get response. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-primary to-saffron">
      {/* Header */}
      <header className="bg-background/95 backdrop-blur-sm border-b border-border shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/")}
            className="hover:bg-secondary"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <Scale className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold text-primary">NyayaGPT Chat</h1>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setLanguage(language === "en" ? "hi" : "en")}
            className="gap-2"
          >
            <Languages className="h-4 w-4" />
            {language === "en" ? "English" : "हिंदी"}
          </Button>
        </div>
      </header>

      {/* Chat Area */}
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="flex flex-col gap-4 mb-24">
          {messages.length === 0 ? (
            <Card className="p-8 text-center bg-background/80 backdrop-blur-sm">
              <Scale className="h-16 w-16 mx-auto mb-4 text-saffron" />
              <h2 className="text-2xl font-bold mb-2 text-foreground">
                {language === "en"
                  ? "Ask Your Legal Question"
                  : "अपना कानूनी सवाल पूछें"}
              </h2>
              <p className="text-muted-foreground">
                {language === "en"
                  ? "I'll help you understand your legal rights and obligations"
                  : "मैं आपको आपके कानूनी अधिकारों और दायित्वों को समझने में मदद करूंगा"}
              </p>
            </Card>
          ) : (
            messages.map((msg, idx) => (
              <Card
                key={idx}
                className={`p-4 ${
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground ml-auto max-w-[80%]"
                    : "bg-background/80 backdrop-blur-sm max-w-[90%]"
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.content}</div>
              </Card>
            ))
          )}
          {isLoading && (
            <Card className="p-4 bg-background/80 backdrop-blur-sm max-w-[90%]">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
            </Card>
          )}
        </div>

        {/* Input Area - Fixed at bottom */}
        <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-t border-border p-4">
          <div className="container mx-auto max-w-4xl flex gap-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder={
                language === "en"
                  ? "Type your legal question..."
                  : "अपना कानूनी सवाल लिखें..."
              }
              className="resize-none"
              rows={2}
              disabled={isLoading}
            />
            <Button
              onClick={sendMessage}
              disabled={!input.trim() || isLoading}
              size="icon"
              className="h-auto bg-saffron hover:bg-saffron/90 text-saffron-foreground"
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Send className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;
