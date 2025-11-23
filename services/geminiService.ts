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
Your persona is a savvy financial mentor and "Gamified Finance Judge" who applies principles from books like "Rich Dad Poor Dad", "The Richest Man in Babylon", and "The Psychology of Money".

Context:
- Currency is Malawi Kwacha (MWK).
- Analyze inflows, outflows, categories, and red flags.
- Detect bank identity from visual cues or text.
- Convert USD/EUR to MWK if necessary (approximate).
- ALWAYS distinguish between "Assets" (puts money in pocket) and "Liabilities" (takes money out).
- Focus on Cash Flow and "Paying Yourself First".
- SCORE the user based on their financial behavior found in the statement.
`;

const RESPONSE_SCHEMA: Schema = {
  type: Type.OBJECT,
  properties: {
    markdownReport: {
      type: Type.STRING,
      description: "The full formatted report following the strict Markdown template provided in the prompt.",
    },
    inflow: {
      type: Type.NUMBER,
      description: "Total numeric value of all credits/inflows in MWK.",
    },
    outflow: {
      type: Type.NUMBER,
      description: "Total numeric value of all debits/outflows in MWK.",
    },
    categories: {
      type: Type.ARRAY,
      description: "List of spending categories for visualization.",
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          value: { type: Type.NUMBER, description: "Amount in MWK" },
        },
        required: ["name", "value"],
      },
    },
    topInflows: {
      type: Type.ARRAY,
      description: "Top 5 largest credit transactions.",
      items: {
        type: Type.OBJECT,
        properties: {
          date: { type: Type.STRING },
          description: { type: Type.STRING },
          amount: { type: Type.NUMBER },
          category: { type: Type.STRING, description: "Guess source: Salary, Business, etc." }
        },
        required: ["date", "description", "amount"]
      }
    },
    topOutflows: {
      type: Type.ARRAY,
      description: "Top 5 largest debit transactions.",
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
      description: "List of strings describing potential issues or observations (e.g. 'Huge Amazon spending').",
      items: { type: Type.STRING }
    },
    financialWisdom: {
      type: Type.ARRAY,
      description: "3 structured wisdom items from the specific books.",
      items: {
        type: Type.OBJECT,
        properties: {
          book: { type: Type.STRING },
          quote: { type: Type.STRING },
          tactic: { type: Type.STRING, description: "Personalized advice based on statement." }
        },
        required: ["book", "quote", "tactic"]
      }
    },
    financialScore: {
      type: Type.INTEGER,
      description: "A gamified score from 0 to 100 based on cashflow, savings, and spending habits.",
    },
    financialRank: {
      type: Type.STRING,
      description: "A creative rank title based on the score (e.g., 'Rat Race Runner', 'Wealth Apprentice', 'Cashflow Master').",
    },
    scoreFeedback: {
      type: Type.STRING,
      description: "A 1-sentence explanation of why they got this score, citing specific habits.",
    },
  },
  required: ["markdownReport", "inflow", "outflow", "categories", "topInflows", "topOutflows", "redFlags", "financialWisdom", "financialScore", "financialRank", "scoreFeedback"],
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
        // Note: No responseSchema/MimeType allowed with googleSearch
      },
    });

    // Extract sources
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

    // Filter duplicates based on URI
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
  Analyze the attached bank statement image/PDF.
  
  Generate a response containing two parts:
  1. A 'markdownReport' that strictly follows this format:

  ### Bank Statement Quick Summary – [Bank Name]
  Account: [Account number] | Name: [Account holder name]  
  Period: [From date] → [To date]  
  Currency: MWK

  #### Key Figures
  - Opening balance: **MWK X**
  - Closing balance: **MWK Y**
  - Net change: **±MWK Z** (+/- %)

  #### Total Inflows vs Outflows
  - Total credits/incoming: **MWK X**
  - Total debits/outgoing: **MWK Y**
  - Net cash flow: **±MWK Z**

  ### Top 5 Largest Credits (Revenue/Income)
  1. [Date] – [Description] → **+MWK X** (e.g., Salary / Business Sales)

  ### Top 5 Largest Debits (Expenses/Liabilities)
  1. [Date] – [Description] → **−MWK X** (e.g., Car Loan / Shopping / School fees)

  ### Spending Categories (This Month)
  | Category                | Amount (MWK)      | Notes |
  |-------------------------|-------------------|-------|
  | [Category Name]         | [Amount]          | [Notes] |

  ### Red Flags & Smart Observations
  (Numbered list – be direct and helpful, never judgmental)

  ### Quick Financial Health (1–2 sentences)

  ### Recommendations (short bullet list)
  - [Rec 1]
  - [Rec 2]

  2. Extract Structured Data:
     - 'inflow', 'outflow', 'categories'
     - 'topInflows': Array of largest credit transactions.
     - 'topOutflows': Array of largest debit transactions.
     - 'redFlags': List of potential issues.
     - 'financialWisdom': Array of 3 objects, one for each book: "Rich Dad Poor Dad", "The Richest Man in Babylon", "The Psychology of Money". Provide a quote and a specific tactic based on this user's statement.
     - 'financialScore': 0-100. Criteria:
        - High savings rate (>20%) = +Points
        - Positive cash flow = +Points
        - Frequent gambling/betting/luxury = -Points
        - "Rat Race" living (Income approx equals Expense) = Low Score (~40-50)
     - 'financialRank': Give them a title based on the score.
        - 0-40: "Consumer Trap" or "Rat Race Runner"
        - 41-60: "Break-Even Battler"
        - 61-80: "Smart Saver" or "Asset Builder"
        - 81-100: "Cashflow Master" or "Financial Freedom Fighter"
     - 'scoreFeedback': Why did they get this score? (e.g. "You spent 90% of your income on liabilities this month.")
  `;

  try {
    // 1. Primary Analysis (Structured Data)
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

    // 2. Secondary Analysis (Search Grounding)
    // We pass the result from step 1 to inform the search query
    const investmentInsights = await fetchInvestmentInsights(ai, result);
    result.investmentInsights = investmentInsights;

    return result;

  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw new Error("Failed to analyze the document. Please try a clearer image or a different file.");
  }
};