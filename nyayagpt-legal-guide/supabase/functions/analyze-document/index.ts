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
    const { fileData, fileName, fileType, language } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("Analyzing document:", fileName, "Type:", fileType);

    // Extract base64 data
    const base64Data = fileData.split(",")[1] || fileData;

    // System prompt for document analysis
    const systemPrompt = language === "hi"
      ? `आप एक कानूनी दस्तावेज़ विश्लेषक हैं। दस्तावेज़ से निम्नलिखित निकालें:

1. **सारांश**: दस्तावेज़ का संक्षिप्त सार (2-3 वाक्य)
2. **नाम**: सभी व्यक्तियों/संस्थाओं के नाम
3. **तिथियां**: सभी महत्वपूर्ण तिथियां और समय सीमा
4. **अधिकार**: उल्लिखित कानूनी अधिकार
5. **दायित्व**: उल्लिखित दायित्व और जिम्मेदारियां
6. **दंड**: किसी भी दंड, जुर्माने या जोखिम (यदि हों)

JSON प्रारूप में उत्तर दें:
{
  "summary": "संक्षिप्त सारांश",
  "entities": {
    "names": ["नाम1", "नाम2"],
    "dates": ["तिथि1", "तिथि2"],
    "rights": ["अधिकार1", "अधिकार2"],
    "obligations": ["दायित्व1", "दायित्व2"],
    "penalties": ["दंड1", "दंड2"]
  }
}

यदि कोई श्रेणी खाली है, तो खाली सरणी लौटाएं []`
      : `You are a legal document analyzer. Extract the following from the document:

1. **Summary**: Brief summary of the document (2-3 sentences)
2. **Names**: All person/entity names mentioned
3. **Dates**: All important dates and deadlines
4. **Rights**: Legal rights mentioned
5. **Obligations**: Obligations and responsibilities mentioned
6. **Penalties**: Any penalties, fines, or risks (if any)

Respond in JSON format:
{
  "summary": "Brief summary here",
  "entities": {
    "names": ["Name1", "Name2"],
    "dates": ["Date1", "Date2"],
    "rights": ["Right1", "Right2"],
    "obligations": ["Obligation1", "Obligation2"],
    "penalties": ["Penalty1", "Penalty2"]
  }
}

If any category is empty, return an empty array []`;

    // For images, use vision capability
    const messages = fileType.startsWith("image/")
      ? [
          {
            role: "user",
            content: [
              { type: "text", text: systemPrompt },
              {
                type: "image_url",
                image_url: {
                  url: `data:${fileType};base64,${base64Data}`,
                },
              },
            ],
          },
        ]
      : [
          {
            role: "user",
            content: `${systemPrompt}\n\nNote: For PDFs, extract text first then analyze. Document type: ${fileType}`,
          },
        ];

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
          messages,
          temperature: 0.3,
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

    console.log("Raw AI response:", aiResponse);

    // Parse JSON from response
    let analysis;
    try {
      // Extract JSON from markdown code blocks if present
      const jsonMatch = aiResponse.match(/```json\n([\s\S]*?)\n```/) ||
                       aiResponse.match(/```\n([\s\S]*?)\n```/) ||
                       [null, aiResponse];
      const jsonStr = jsonMatch[1] || aiResponse;
      analysis = JSON.parse(jsonStr.trim());
    } catch (parseError) {
      console.error("Failed to parse AI response as JSON:", parseError);
      // Fallback: create structured response from text
      analysis = {
        summary: aiResponse,
        entities: {
          names: [],
          dates: [],
          rights: [],
          obligations: [],
          penalties: [],
        },
      };
    }

    console.log("Document analysis completed successfully");

    return new Response(
      JSON.stringify({ analysis }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in analyze-document function:", error);
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
