import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { MessageSquare, FileText, Scale, Shield, Languages, Zap } from "lucide-react";
import { useState } from "react";

const Index = () => {
  const navigate = useNavigate();
  const [language, setLanguage] = useState<"en" | "hi">("en");

  const content = {
    en: {
      title: "NyayaGPT",
      subtitle: "AI Legal Assistant for Citizens",
      description: "Understand your legal rights and obligations with AI-powered guidance",
      chatTitle: "Ask NyayaGPT",
      chatDesc: "Get instant answers to your legal questions",
      docTitle: "Document Analysis",
      docDesc: "Upload legal documents for AI-powered analysis",
      features: [
        {
          icon: Shield,
          title: "Know Your Rights",
          desc: "Clear explanations of your legal rights",
        },
        {
          icon: Zap,
          title: "Instant Answers",
          desc: "Get quick responses to legal queries",
        },
        {
          icon: Languages,
          title: "Hindi & English",
          desc: "Support for both languages",
        },
      ],
      disclaimer: "⚖️ Informational only - Not a substitute for legal counsel",
    },
    hi: {
      title: "न्यायGPT",
      subtitle: "नागरिकों के लिए AI कानूनी सहायक",
      description: "AI-संचालित मार्गदर्शन के साथ अपने कानूनी अधिकारों और दायित्वों को समझें",
      chatTitle: "न्यायGPT से पूछें",
      chatDesc: "अपने कानूनी सवालों के तुरंत जवाब पाएं",
      docTitle: "दस्तावेज़ विश्लेषण",
      docDesc: "AI-संचालित विश्लेषण के लिए कानूनी दस्तावेज़ अपलोड करें",
      features: [
        {
          icon: Shield,
          title: "अपने अधिकार जानें",
          desc: "आपके कानूनी अधिकारों की स्पष्ट व्याख्या",
        },
        {
          icon: Zap,
          title: "तुरंत उत्तर",
          desc: "कानूनी सवालों के त्वरित जवाब पाएं",
        },
        {
          icon: Languages,
          title: "हिंदी और अंग्रेजी",
          desc: "दोनों भाषाओं के लिए समर्थन",
        },
      ],
      disclaimer: "⚖️ केवल सूचनात्मक - कानूनी परामर्श का विकल्प नहीं",
    },
  };

  const t = content[language];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-primary to-saffron">
      {/* Hero Section */}
      <header className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-12">
          <div className="flex items-center gap-3">
            <div className="bg-saffron p-3 rounded-2xl shadow-lg">
              <Scale className="h-8 w-8 text-primary" />
            </div>
          </div>
          <Button
            variant="outline"
            onClick={() => setLanguage(language === "en" ? "hi" : "en")}
            className="gap-2 bg-background/80 backdrop-blur-sm hover:bg-background"
          >
            <Languages className="h-4 w-4" />
            {language === "en" ? "हिंदी" : "English"}
          </Button>
        </div>

        <div className="text-center max-w-4xl mx-auto mb-12">
          <h1 className="text-5xl md:text-6xl font-bold text-background mb-4 tracking-tight">
            {t.title}
          </h1>
          <p className="text-xl md:text-2xl text-background/90 mb-2 font-medium">
            {t.subtitle}
          </p>
          <p className="text-lg text-background/80">
            {t.description}
          </p>
        </div>
      </header>

      {/* Main Actions */}
      <main className="container mx-auto px-4 pb-16">
        <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto mb-12">
          <Card
            className="group p-8 bg-background/95 backdrop-blur-sm hover:shadow-2xl transition-all duration-300 cursor-pointer hover:-translate-y-1 border-2 hover:border-saffron"
            onClick={() => navigate("/chat")}
          >
            <div className="flex flex-col items-center text-center">
              <div className="bg-gradient-to-br from-primary to-primary/80 p-4 rounded-2xl mb-4 group-hover:scale-110 transition-transform">
                <MessageSquare className="h-12 w-12 text-primary-foreground" />
              </div>
              <h2 className="text-2xl font-bold mb-2 text-foreground">
                {t.chatTitle}
              </h2>
              <p className="text-muted-foreground mb-6">
                {t.chatDesc}
              </p>
              <Button className="bg-saffron hover:bg-saffron/90 text-saffron-foreground w-full">
                {language === "en" ? "Start Chat" : "चैट शुरू करें"}
              </Button>
            </div>
          </Card>

          <Card
            className="group p-8 bg-background/95 backdrop-blur-sm hover:shadow-2xl transition-all duration-300 cursor-pointer hover:-translate-y-1 border-2 hover:border-gold"
            onClick={() => navigate("/document-analysis")}
          >
            <div className="flex flex-col items-center text-center">
              <div className="bg-gradient-to-br from-gold to-gold/80 p-4 rounded-2xl mb-4 group-hover:scale-110 transition-transform">
                <FileText className="h-12 w-12 text-gold-foreground" />
              </div>
              <h2 className="text-2xl font-bold mb-2 text-foreground">
                {t.docTitle}
              </h2>
              <p className="text-muted-foreground mb-6">
                {t.docDesc}
              </p>
              <Button className="bg-gold hover:bg-gold/90 text-gold-foreground w-full">
                {language === "en" ? "Upload Document" : "दस्तावेज़ अपलोड करें"}
              </Button>
            </div>
          </Card>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-8">
          {t.features.map((feature, idx) => (
            <Card
              key={idx}
              className="p-6 bg-background/80 backdrop-blur-sm border-none text-center"
            >
              <feature.icon className="h-10 w-10 mx-auto mb-3 text-saffron" />
              <h3 className="font-semibold mb-2 text-foreground">
                {feature.title}
              </h3>
              <p className="text-sm text-muted-foreground">{feature.desc}</p>
            </Card>
          ))}
        </div>

        {/* Disclaimer */}
        <Card className="p-4 max-w-3xl mx-auto bg-muted/50 backdrop-blur-sm border-none">
          <p className="text-sm text-muted-foreground text-center italic">
            {t.disclaimer}
          </p>
        </Card>
      </main>
    </div>
  );
};

export default Index;
