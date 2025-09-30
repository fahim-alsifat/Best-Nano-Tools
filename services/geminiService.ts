import { GoogleGenAI, Modality } from "@google/genai";

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      // Remove the "data:mime/type;base64," prefix
      resolve(result.split(',')[1]);
    };
    reader.onerror = (error) => reject(error);
  });
};

export const generateStyledImage = async (
  mainImage: File,
  referenceImage: File,
  commands: string
): Promise<string | null> => {
  if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable is not set.");
  }
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const mainImageBase64 = await fileToBase64(mainImage);
  const referenceImageBase64 = await fileToBase64(referenceImage);

  const prompt = `You are a highly skilled digital artist specializing in style transfer. Your task is to repaint the subject from the main image using the complete aesthetic of the reference image.

**Main Image:** Contains the subject to be restyled.
**Reference Image:** Provides the target style.

**Your Goal:**
Generate a new image where the subject from the Main Image is seamlessly integrated into the world of the Reference Image. You must replicate the following stylistic elements from the Reference Image exactly:
- **Lighting:** Match the direction, softness, and color of the light.
- **Color Palette:** Use the same colors and overall color grading.
- **Composition:** Adapt the composition to match the reference style.
- **Background:** Replace the main image's background with one that fits the reference style.
- **Texture/Medium:** If the reference is a painting, replicate the brushstrokes. If it's a photo, match the grain and focus.

${commands ? `**Additional Edits:** ${commands}` : ''}

Crucially, the final output must be the image itself, with no additional text or explanation.`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image-preview',
    contents: {
      parts: [
        {
          inlineData: {
            data: mainImageBase64,
            mimeType: mainImage.type,
          },
        },
        {
          inlineData: {
            data: referenceImageBase64,
            mimeType: referenceImage.type,
          },
        },
        {
          text: prompt,
        },
      ],
    },
    config: {
      responseModalities: [Modality.IMAGE, Modality.TEXT],
    },
  });

  // Find the image part in the response
  const imagePart = response.candidates?.[0]?.content?.parts?.find(
    (part) => part.inlineData
  );

  if (imagePart && imagePart.inlineData) {
    return imagePart.inlineData.data;
  }

  // Check if there's a text response from the model instead of an image
  const textPart = response.candidates?.[0]?.content?.parts?.find(
    (part) => part.text
  );
  
  if (textPart && textPart.text) {
    // If the model responded with text, it's likely an explanation for failure.
    throw new Error(`The AI model responded with: ${textPart.text}`);
  }

  return null;
};