import { GoogleGenAI, Type, Schema } from "@google/genai";
import { CareerPlan } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Helper to convert File to base64
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      // Remove the data URL prefix (e.g., "data:image/jpeg;base64,")
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = (error) => reject(error);
  });
};

export const detectSubjectType = async (base64Image: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Image,
              mimeType: 'image/jpeg', // Assuming jpeg for simplicity, detection is robust
            },
          },
          {
            text: `Analyze this image. Identify the main subject. 
            If it is a human, return exactly "Human". 
            If it is an animal, return the specific species and breed/color if clear (e.g., "Golden Retriever", "Siamese Cat", "Hamster").
            Return ONLY the subject string.`
          },
        ],
      },
    });
    const subject = response.text?.trim() || "Human";
    return subject;
  } catch (error) {
    console.error("Error detecting subject:", error);
    return "Human"; // Fallback
  }
};

export const generateCareerImage = async (base64Image: string, career: string, subjectDescription: string, mimeType: string = 'image/jpeg'): Promise<string> => {
  try {
    // Adjusted prompt to avoid strict identity safety filters while requesting likeness
    const prompt = subjectDescription === "Human"
      ? `Generate a photorealistic portrait of a person resembling the subject in the input image, reimagined as a ${career}.
         The person should be wearing professional ${career} attire and placed in a relevant environment.
         High quality, cinematic lighting, 8k resolution.`
      : `Create a photorealistic, adorable, and funny portrait of a ${subjectDescription} dressed as a ${career}.
         The animal should be wearing the professional attire of a ${career} (e.g. uniform, suit, gear).
         Match the fur color and markings of the original animal.
         The animal should look like they are seriously doing the job.
         High quality, cinematic lighting.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Image,
              mimeType: mimeType,
            },
          },
          { text: prompt },
        ],
      },
    });

    if (response.candidates && response.candidates[0].content.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData && part.inlineData.data) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
    }
    
    // If we get text instead of an image, it's usually a refusal or description
    const textPart = response.candidates?.[0]?.content?.parts?.find(p => p.text);
    if (textPart) {
        console.warn("Gemini returned text instead of image:", textPart.text);
    }
    
    throw new Error("No image generated.");
  } catch (error) {
    console.error("Error generating career image:", error);
    throw error;
  }
};

export const generateCareerPlan = async (career: string, subjectDescription: string): Promise<CareerPlan> => {
  const linkableItemSchema: Schema = {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING },
      url: { type: Type.STRING, description: "A valid URL or search URL." }
    },
    required: ["title", "url"]
  };

  const schema: Schema = {
    type: Type.OBJECT,
    properties: {
      career: { type: Type.STRING },
      isFictional: { type: Type.BOOLEAN },
      intro: { type: Type.STRING },
      skillsToDevelop: { type: Type.ARRAY, items: { type: Type.STRING } },
      thoughtLeaders: { type: Type.ARRAY, items: linkableItemSchema },
      recommendedCourses: { type: Type.ARRAY, items: linkableItemSchema },
      targetCompanies: { type: Type.ARRAY, items: linkableItemSchema },
      weeks: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            weekNumber: { type: Type.INTEGER },
            theme: { type: Type.STRING },
            goals: { type: Type.ARRAY, items: { type: Type.STRING } },
            actionItems: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
          required: ["weekNumber", "theme", "goals", "actionItems"]
        }
      }
    },
    required: ["career", "isFictional", "intro", "weeks", "skillsToDevelop", "thoughtLeaders", "recommendedCourses", "targetCompanies"]
  };

  const isPet = subjectDescription !== "Human";
  
  const prompt = `Create an 8-week career transition plan for a ${subjectDescription} becoming a "${career}".
      
  CONTEXT: The subject is a ${subjectDescription}.
  ${isPet ? `
  IMPORTANT: Since the subject is an animal (${subjectDescription}), the entire plan MUST be satirical, funny, and tailored to that animal's behaviors.
  - Skills should relate to the animal (e.g., for a Cat CEO: "Knocking mugs off tables with authority").
  - "Thought Leaders" should be famous animals or funny animal puns.
  - "Target Companies" should be animal-related puns (e.g., "Purr-waterhouseCoopers").
  - The tone should be professional yet absurdly specific to the animal species.
  ` : `
  If the career is REAL (e.g., Accountant, Chef): Provide actionable advice, real thought leaders, and real companies.
  If the career is FICTIONAL (e.g., Wizard): Write in a professional but satirical tone.
  `}
  
  Return the response in JSON format according to the schema.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
      },
    });

    const text = response.text;
    if (!text) throw new Error("No text response from Gemini");

    return JSON.parse(text) as CareerPlan;
  } catch (error) {
    console.error("Error generating career plan:", error);
    throw error;
  }
};