import { GoogleGenAI, Schema, Type } from "@google/genai";
import { AnalysisResult, InvestmentInsight, Source } from "../types";

const MODEL_NAME = "gemini-2.5-flash";

// Helper to convert File to Base64
const fileToGenerativePart = async (file: File): Promise<{ inlineData: { data: string; mimeType: string } }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      // Remove data url prefix (e.g., "data:image/jpeg;base64,")
      const base64Data = base64String.split(',')[1];
      resolve({
        inlineData: {
          data: base64Data,
          mimeType: file.type,
        },
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

const SYSTEM_INSTRUCTION = `
You are MalawiBank Analyzer, an intelligent personal-finance assistant specialized in Malawian bank statements.
Your persona is a savvy financial mentor and "Gamified Finance Judge".

**CORE MISSION:**
Make the user FEEL the weight of their spending by converting abstract numbers into TANGIBLE MALAWIAN REALITIES.
Don't just say "You spent MWK 20,000 on booze". Say "You spent MWK 20,000 on booze, which could have bought a bag of Fertilizer."

**CONTEXT & PRICES (Estimates for 2025):**
- Bag of Cement: ~MWK 20,000
- Bag of Fertilizer (NPK/Urea): ~MWK 90,000
- Loaf of Bread: ~MWK 1,100
- 1 Liter Petrol: ~MWK 2,530
- School Shoes (Bata): ~MWK 15,000
- Minibus Trip (local): ~MWK 1,000

**SMART CATEGORIZATION:**
1. **Merchants:** 
   - Shoprite, Chipiku, Sana = Groceries.
   - KFC, Debonairs, Steers, Mugg & Bean = Fast Food/Dining (Luxury).
   - Puma, Total, Mount Meru = Fuel/Transport.
   - ESCOM (Electricity), LWB/BWB (Water) = Utilities.
   - Airtel Money, Mpamba = Mobile Transactions (Check if cash out or payment).
   - Betway, Premier Bet, World Star = Gambling (RED FLAG).
   
2. **Logic:**
   - Recurring amounts = Subscriptions.
   - Loan repayments = Debt Service.

**FINANCIAL IQ RUBRIC (0-100 SCORE):**
- **0-39 (Rat Race Prisoner):** Negative cash flow, high gambling/betting, or luxury spending > 50% of income. 
- **40-59 (Survivor):** Breaking even, no savings, frequent small unnecessary withdrawals.
- **60-79 (Wealth Builder):** Positive cash flow, saving 10-20%, sensible spending ratios.
- **80-100 (Freedom Fighter):** High savings rate (>25%), evidence of investments, assets > liabilities.

**FEEDBACK GUIDELINES:**
- Give "Tough Love". Be direct.
- Example: "Your score is low because you spent MWK 50k on betting. Stop feeding the machine."
`;

const RESPONSE_SCHEMA: Schema = {
  type: Type.OBJECT,
  properties: {
    markdownReport: {
      type: Type.STRING,
      description: "The full formatted report following the markdown template.",
    },
    inflow: { type: Type.NUMBER },
    outflow: { type: Type.NUMBER },
    categories: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          value: { type: Type.NUMBER },
        },
        required: ["name", "value"],
      },
    },
    topInflows: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          date: { type: Type.STRING },
          description: { type: Type.STRING },
          amount: { type: Type.NUMBER },
          category: { type: Type.STRING }
        },
        required: ["date", "description", "amount"]
      }
    },
    topOutflows: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          date: { type: Type.STRING },
          description: { type: Type.STRING },
          amount: { type: Type.NUMBER },
          category: { type: Type.STRING }
        },
        required: ["date", "description", "amount"]
      }
    },
    redFlags: {
      type: Type.ARRAY,
      items: { type: Type.STRING }
    },
    financialWisdom: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          book: { type: Type.STRING },
          quote: { type: Type.STRING },
          tactic: { type: Type.STRING }
        },
        required: ["book", "quote", "tactic"]
      }
    },
    financialScore: { type: Type.INTEGER },
    financialRank: { type: Type.STRING },
    scoreFeedback: { type: Type.STRING },
    realityCheck: {
      type: Type.OBJECT,
      description: "A harsh reality check converting wasteful spending into missed opportunities.",
      properties: {
        wasteCategory: { type: Type.STRING, description: "The category with the most unnecessary spending (e.g. 'Alcohol', 'Fast Food', 'Betting')." },
        wasteAmount: { type: Type.NUMBER, description: "Total amount wasted in this category." },
        opportunityCost: { type: Type.STRING, description: "What this amount could have bought in Malawi (e.g. '3 Bags of Cement', '1 Bag of Fertilizer'). Use the prices provided in instructions." },
        itemIcon: { type: Type.STRING, enum: ['CEMENT', 'FERTILIZER', 'PETROL', 'BREAD', 'SCHOOL_SHOES'], description: "The type of item used for comparison." },
        runwayDays: { type: Type.INTEGER, description: "Based on current closing balance and average daily spend, how many days until balance is 0? If positive cashflow, return 999." },
        runwayMessage: { type: Type.STRING, description: "A message about their runway (e.g. 'You will run out of cash in 12 days at this rate' or 'You are safe for now')." }
      },
      required: ["wasteCategory", "wasteAmount", "opportunityCost", "itemIcon", "runwayDays", "runwayMessage"]
    }
  },
  required: ["markdownReport", "inflow", "outflow", "categories", "topInflows", "topOutflows", "redFlags", "financialWisdom", "financialScore", "financialRank", "scoreFeedback", "realityCheck"],
};

// Secondary function for Search Grounding
const fetchInvestmentInsights = async (ai: GoogleGenAI, analysis: AnalysisResult): Promise<InvestmentInsight> => {
  try {
    const netFlow = analysis.inflow - analysis.outflow;
    const prompt = `
      Context: User is based in Malawi. 
      Financial Profile: Rank "${analysis.financialRank}" (Score: ${analysis.financialScore}/100).
      Recent Net Cash Flow: MWK ${netFlow.toLocaleString()}.
      
      Task: Using Google Search, find REAL-TIME investment opportunities in Malawi right now (2024/2025).
      Search for:
      1. Current Reserve Bank of Malawi (RBM) reference rates or inflation rates.
      2. Latest performance of Unit Trusts in Malawi (e.g., Old Mutual, Nico Asset Management, Bridgepath).
      3. Top performing stocks on the Malawi Stock Exchange (MSE) recently.
      
      Output:
      Provide a concise Markdown advice section titled "Malawi Market Pulse".
      Based on their rank ("${analysis.financialRank}"), suggest 3 specific moves they should make in the Malawian market TODAY to improve their score.
      Include specific percentage rates (e.g., "18% p.a.") if found in search.
    `;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const sources: Source[] = [];
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    
    if (chunks) {
      chunks.forEach((chunk: any) => {
        if (chunk.web) {
          sources.push({
            title: chunk.web.title || "Source",
            uri: chunk.web.uri,
          });
        }
      });
    }

    const uniqueSources = sources.filter((v, i, a) => a.findIndex(t => (t.uri === v.uri)) === i);

    return {
      advice: response.text || "Could not generate investment insights at this time.",
      sources: uniqueSources,
    };

  } catch (error) {
    console.warn("Investment Search Error:", error);
    return {
      advice: "Offline mode: Stick to the basics. Save at least 20% of income and look for assets that appreciate.",
      sources: []
    };
  }
};

export const analyzeStatement = async (file: File): Promise<AnalysisResult> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key not found in environment variables.");
  }

  const ai = new GoogleGenAI({ apiKey });
  
  const filePart = await fileToGenerativePart(file);

  const prompt = `
  Analyze the attached bank statement.
  
  Generate a response containing two parts:
  1. A 'markdownReport' summarizing Key Figures, Top Inflows/Outflows, Smart Categorization, and Recommendations.

  2. Extract Structured Data as per the schema:
     - 'realityCheck': CRITICAL. Look at their biggest non-essential spending category (Alcohol, Betting, Fast Food, Expensive Clothes). 
        - Calculate how much they spent.
        - Compare it to a REAL Malawian Asset using these approx prices:
          - Bag of Cement = 20,000 MWK
          - Bag of Fertilizer = 90,000 MWK
          - School Shoes = 15,000 MWK
          - Petrol = 2,500 MWK/Liter
        - Example: If they spent 100,000 on 'Entertainment', opportunityCost is "5 Bags of Cement".
     - 'financialScore': Calculate 0-100 based on the 'FINANCIAL IQ RUBRIC'.
     - 'financialRank': Assign the correct Rank name (e.g., 'Rat Race Prisoner', 'Wealth Builder').
     - 'scoreFeedback': A brief, punchy, actionable tip (max 2 sentences) on exactly how to improve this score next month based on their specific spending leaks.
  `;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: {
        role: "user",
        parts: [filePart, { text: prompt }],
      },
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: RESPONSE_SCHEMA,
      },
    });

    const jsonText = response.text;
    if (!jsonText) {
      throw new Error("No response from Gemini.");
    }

    const result = JSON.parse(jsonText) as AnalysisResult;

    // Secondary Analysis (Search Grounding)
    const investmentInsights = await fetchInvestmentInsights(ai, result);
    result.investmentInsights = investmentInsights;

    return result;

  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw new Error("Failed to analyze the document. Please try a clearer image or a different file.");
  }
};