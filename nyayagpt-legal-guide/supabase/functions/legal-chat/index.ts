import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, language } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("Processing legal chat request in language:", language);

    // System prompt for legal assistance
    const systemPrompt = language === "hi"
      ? `आप एक भारतीय कानूनी सहायक AI हैं। आपको सरल हिंदी में कानूनी सवालों के जवाब देने हैं।

हर जवाब में निम्नलिखित खंड शामिल करें:

**सरल व्याख्या:**
[सरल भाषा में समस्या समझाएं]

**आपके अधिकार:**
• [अधिकार 1]
• [अधिकार 2]
• [अधिकार 3]

**दायित्व / समय सीमा:**
• [दायित्व 1]
• [दायित्व 2]

**दंड / जोखिम (यदि लागू हो):**
• [जोखिम 1]
• [जोखिम 2]

**स्रोत या संदर्भ:**
[यदि विश्वसनीय हो तो संदर्भ दें, अन्यथा "सामान्य कानूनी ज्ञान" कहें]

**अस्वीकरण:**
⚖️ यह जानकारी केवल सूचनात्मक उद्देश्यों के लिए है और कानूनी परामर्श का विकल्प नहीं है। कृपया किसी योग्य वकील से परामर्श लें।

यदि प्रश्न आपराधिक या हानिकारक है, तो हेल्पलाइन नंबर सुझाएं (जैसे: पुलिस 100, महिला हेल्पलाइन 1091)`
      : `You are an AI legal assistant for Indian citizens. Provide clear, structured legal guidance in simple English.

Every response MUST include these sections:

**Simple Explanation:**
[Explain the issue in plain language]

**Your Rights:**
• [Right 1]
• [Right 2]
• [Right 3]

**Obligations / Deadlines:**
• [Obligation 1]
• [Obligation 2]

**Penalties / Risks (if applicable):**
• [Risk 1]
• [Risk 2]

**Source or Reference:**
[Cite source if confident, otherwise state "General legal knowledge"]

**Disclaimer:**
⚖️ This information is for informational purposes only and is not a substitute for legal counsel. Please consult a qualified lawyer.

If the question involves criminal/harmful intent, suggest helplines (e.g., Police: 100, Women Helpline: 1091)`;

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            { role: "system", content: systemPrompt },
            ...messages,
          ],
          temperature: 0.7,
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI Gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({
            error: "Rate limit exceeded. Please try again later.",
          }),
          {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      if (response.status === 402) {
        return new Response(
          JSON.stringify({
            error: "Payment required. Please add credits to continue.",
          }),
          {
            status: 402,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    console.log("Legal chat response generated successfully");

    return new Response(
      JSON.stringify({ response: aiResponse }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in legal-chat function:", error);
    const errorMessage = error instanceof Error ? error.message : "Internal server error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
