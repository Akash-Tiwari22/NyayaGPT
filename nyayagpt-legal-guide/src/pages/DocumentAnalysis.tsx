import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Upload, FileText, Loader2, Languages, Scale } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AnalysisResult {
  summary: string;
  entities: {
    names: string[];
    dates: string[];
    rights: string[];
    obligations: string[];
    penalties: string[];
  };
}

const DocumentAnalysis = () => {
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [language, setLanguage] = useState<"en" | "hi">("en");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Check file type
      const validTypes = ["application/pdf", "image/jpeg", "image/png", "image/jpg"];
      if (!validTypes.includes(selectedFile.type)) {
        toast.error("Please upload a PDF or image file");
        return;
      }
      setFile(selectedFile);
      setAnalysis(null);
    }
  };

  const analyzeDocument = async () => {
    if (!file) return;

    setIsAnalyzing(true);
    try {
      // Convert file to base64
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;

        const { data, error } = await supabase.functions.invoke("analyze-document", {
          body: {
            fileData: base64,
            fileName: file.name,
            fileType: file.type,
            language,
          },
        });

        if (error) throw error;

        if (data?.analysis) {
          setAnalysis(data.analysis);
          toast.success("Document analyzed successfully!");
        }
      };
      reader.readAsDataURL(file);
    } catch (error: any) {
      console.error("Error:", error);
      toast.error(error.message || "Failed to analyze document. Please try again.");
    } finally {
      setIsAnalyzing(false);
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
            <FileText className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold text-primary">Document Analysis</h1>
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

      {/* Content */}
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {!analysis ? (
          <Card className="p-8 bg-background/80 backdrop-blur-sm">
            <div className="text-center mb-6">
              <Scale className="h-16 w-16 mx-auto mb-4 text-saffron" />
              <h2 className="text-2xl font-bold mb-2 text-foreground">
                {language === "en"
                  ? "Upload Legal Document"
                  : "कानूनी दस्तावेज़ अपलोड करें"}
              </h2>
              <p className="text-muted-foreground">
                {language === "en"
                  ? "Upload a PDF or image to extract legal information"
                  : "कानूनी जानकारी निकालने के लिए PDF या इमेज अपलोड करें"}
              </p>
            </div>

            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary transition-colors">
              <input
                type="file"
                id="file-upload"
                className="hidden"
                accept=".pdf,image/*"
                onChange={handleFileChange}
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground mb-2">
                  {language === "en"
                    ? "Click to upload or drag and drop"
                    : "अपलोड करने के लिए क्लिक करें या ड्रैग एंड ड्रॉप करें"}
                </p>
                <p className="text-xs text-muted-foreground">
                  PDF, JPG, PNG (Max 10MB)
                </p>
              </label>
            </div>

            {file && (
              <div className="mt-6">
                <div className="flex items-center justify-between p-4 bg-secondary rounded-lg mb-4">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    <span className="text-sm font-medium">{file.name}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setFile(null)}
                  >
                    Remove
                  </Button>
                </div>
                <Button
                  onClick={analyzeDocument}
                  disabled={isAnalyzing}
                  className="w-full bg-saffron hover:bg-saffron/90 text-saffron-foreground"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    "Analyze Document"
                  )}
                </Button>
              </div>
            )}
          </Card>
        ) : (
          <div className="space-y-6">
            <Card className="p-6 bg-background/80 backdrop-blur-sm">
              <h3 className="text-lg font-semibold mb-3 text-foreground">
                {language === "en" ? "Summary" : "सारांश"}
              </h3>
              <p className="text-foreground whitespace-pre-wrap">
                {analysis.summary}
              </p>
            </Card>

            {analysis.entities.names.length > 0 && (
              <Card className="p-6 bg-background/80 backdrop-blur-sm">
                <h3 className="text-lg font-semibold mb-3 text-foreground">
                  {language === "en" ? "Names" : "नाम"}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {analysis.entities.names.map((name, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
                    >
                      {name}
                    </span>
                  ))}
                </div>
              </Card>
            )}

            {analysis.entities.dates.length > 0 && (
              <Card className="p-6 bg-background/80 backdrop-blur-sm">
                <h3 className="text-lg font-semibold mb-3 text-foreground">
                  {language === "en" ? "Dates & Deadlines" : "तिथियां और समय सीमा"}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {analysis.entities.dates.map((date, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-gold/10 text-gold rounded-full text-sm"
                    >
                      {date}
                    </span>
                  ))}
                </div>
              </Card>
            )}

            {analysis.entities.rights.length > 0 && (
              <Card className="p-6 bg-background/80 backdrop-blur-sm">
                <h3 className="text-lg font-semibold mb-3 text-foreground">
                  {language === "en" ? "Your Rights" : "आपके अधिकार"}
                </h3>
                <ul className="space-y-2">
                  {analysis.entities.rights.map((right, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-saffron">•</span>
                      <span className="text-foreground">{right}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            )}

            {analysis.entities.obligations.length > 0 && (
              <Card className="p-6 bg-background/80 backdrop-blur-sm">
                <h3 className="text-lg font-semibold mb-3 text-foreground">
                  {language === "en" ? "Obligations" : "दायित्व"}
                </h3>
                <ul className="space-y-2">
                  {analysis.entities.obligations.map((obligation, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      <span className="text-foreground">{obligation}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            )}

            {analysis.entities.penalties.length > 0 && (
              <Card className="p-6 bg-destructive/10 border-destructive/20 backdrop-blur-sm">
                <h3 className="text-lg font-semibold mb-3 text-destructive">
                  {language === "en" ? "⚠️ Penalties / Risks" : "⚠️ दंड / जोखिम"}
                </h3>
                <ul className="space-y-2">
                  {analysis.entities.penalties.map((penalty, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-destructive">•</span>
                      <span className="text-destructive">{penalty}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            )}

            <Card className="p-4 bg-muted/50 backdrop-blur-sm border-muted">
              <p className="text-sm text-muted-foreground italic text-center">
                {language === "en"
                  ? "⚖️ Disclaimer: This analysis is for informational purposes only and is not a substitute for legal counsel. Please consult a qualified lawyer for legal advice."
                  : "⚖️ अस्वीकरण: यह विश्लेषण केवल सूचनात्मक उद्देश्यों के लिए है और कानूनी परामर्श का विकल्प नहीं है। कृपया कानूनी सलाह के लिए किसी योग्य वकील से परामर्श करें।"}
              </p>
            </Card>

            <Button
              onClick={() => {
                setFile(null);
                setAnalysis(null);
              }}
              variant="outline"
              className="w-full"
            >
              {language === "en" ? "Analyze Another Document" : "दूसरा दस्तावेज़ विश्लेषण करें"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentAnalysis;
