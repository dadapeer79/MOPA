import { z } from 'zod';

type FlowDefinition<T extends z.ZodType, U extends z.ZodType> = {
  name: string;
  inputSchema?: T;
  outputSchema: U;
};

type PromptDefinition<T extends z.ZodType, U extends z.ZodType> = {
  name: string;
  input: { schema: T };
  output: { schema: U };
  prompt: string;
};

type ToolDefinition<U extends z.ZodType> = {
  name: string;
  description: string;
  outputSchema: U;
};

type GenerateOptions = {
  model: string;
  config: {
    responseModalities: string[];
    speechConfig?: {
      voiceConfig: {
        prebuiltVoiceConfig: { voiceName: string };
      };
      languageCode: string;
    };
  };
  prompt: string;
};

class GenKit {
  defineFlow<T extends z.ZodType, U extends z.ZodType>(
    def: FlowDefinition<T, U>,
    handler: (input: z.infer<T>) => Promise<z.infer<U>>
  ) {
    return handler;
  }

  definePrompt<T extends z.ZodType, U extends z.ZodType>(
    def: PromptDefinition<T, U>
  ) {
    return async (input: z.infer<T>) => {
      // Extract template variables from the prompt
      const prompt = def.prompt.replace(/\{\{\{(\w+)\}\}\}/g, (_, key) => {
        return String((input as any)[key]);
      });
      
      // Process the input based on business logic
      const safetyStockDays = (input as any).safetyStockDays || 7;
      const salesVelocity = (input as any).salesVelocity;
      const currentInventory = (input as any).currentInventory;
      const reorderPoint = (input as any).reorderPoint;
      const leadTimeDays = (input as any).leadTimeDays;
      const productName = (input as any).productName;
      const language = (input as any).language;

      // Calculate required quantities
      const safetyStock = salesVelocity * safetyStockDays;
      const leadTimeDemand = salesVelocity * leadTimeDays;
      const inventoryRunoutDays = salesVelocity === 0 ? 999 : currentInventory / salesVelocity;
      
      // Calculate suggested order quantity
      let suggestedOrderQuantity = 0;
      if (currentInventory <= reorderPoint) {
        suggestedOrderQuantity = Math.max(0, 
          Math.ceil(leadTimeDemand + safetyStock - currentInventory)
        );
      }

      // Generate reasoning in the requested language
      let reasoning = '';
      const suggestedApps = ['Zepto', 'Flipkart', 'Blinkit', 'BigBasket', 'JioMart'];

      switch(language) {
        case 'hi':
          reasoning = `${productName} के लिए स्मार्ट इन्वेंटरी विश्लेषण 📊\n\n` +
            `🔍 वर्तमान स्थिति:\n` +
            `• स्टॉक: ${currentInventory} इकाई (${Math.round(inventoryRunoutDays)} दिन चलेगा)\n` +
            `• बिक्री: प्रति दिन ${salesVelocity} इकाई\n` +
            `• डिलीवरी समय: ${leadTimeDays} दिन\n\n` +
            `⚡ तत्काल कार्रवाई:\n` +
            (suggestedOrderQuantity > 0 
              ? `✓ अभी ${suggestedOrderQuantity} इकाई ऑर्डर करें\n` +
                `✓ अनुमानित लागत: ₹${suggestedOrderQuantity * 50} (औसत दर से)\n` +
                `✓ जल्द ऑर्डर करें - स्टॉक ${reorderPoint} इकाई से नीचे है`
              : `✓ अभी ऑर्डर करने की जरूरत नहीं\n` +
                `✓ अगला ऑर्डर ${reorderPoint} इकाई पर करें\n` +
                `✓ वर्तमान स्टॉक पर्याप्त है`) + `\n\n` +
            `🛒 खरीदारी के विकल्प:\n` +
            `• Zepto - तुरंत डिलीवरी\n` +
            `• BigBasket - बल्क ऑर्डर के लिए\n` +
            `• JioMart - किफायती विकल्प\n\n` +
            `💡 विशेष सुझाव:\n` +
            `• सुरक्षित स्टॉक: ${safetyStock} इकाई रखें\n` +
            `• ऑर्डर का सही समय: स्टॉक ${reorderPoint} इकाई पर पहुंचने पर\n` +
            `• औसत दैनिक बिक्री ट्रैक करें`;
          break;
        
        case 'kn':
          reasoning = `${productName} ಗಾಗಿ ಸ್ಮಾರ್ಟ್ ದಾಸ್ತಾನು ವಿಶ್ಲೇಷಣೆ 📊\n\n` +
            `🔍 ಪ್ರಸ್ತುತ ಸ್ಥಿತಿ:\n` +
            `• ದಾಸ್ತಾನು: ${currentInventory} ಘಟಕಗಳು (${Math.round(inventoryRunoutDays)} ದಿನಗಳ ದಾಸ್ತಾನು)\n` +
            `• ಮಾರಾಟ: ಪ್ರತಿ ದಿನ ${salesVelocity} ಘಟಕಗಳು\n` +
            `• ತಲುಪುವ ಸಮಯ: ${leadTimeDays} ದಿನಗಳು\n\n` +
            `⚡ ತುರ್ತು ಕ್ರಮ:\n` +
            (suggestedOrderQuantity > 0 
              ? `✓ ಈಗ ${suggestedOrderQuantity} ಘಟಕಗಳನ್ನು ಆದೇಶಿಸಿ\n` +
                `✓ ಅಂದಾಜು ವೆಚ್ಚ: ₹${suggestedOrderQuantity * 50} (ಸರಾಸರಿ ದರದಲ್ಲಿ)\n` +
                `✓ ಬೇಗ ಆದೇಶಿಸಿ - ದಾಸ್ತಾನು ${reorderPoint} ಘಟಕಗಳಿಗಿಂತ ಕಡಿಮೆ ಇದೆ`
              : `✓ ಈಗ ಆದೇಶಿಸುವ ಅಗತ್ಯವಿಲ್ಲ\n` +
                `✓ ಮುಂದಿನ ಆದೇಶ ${reorderPoint} ಘಟಕಗಳಲ್ಲಿ\n` +
                `✓ ಪ್ರಸ್ತುತ ದಾಸ್ತಾನು ಸಾಕಷ್ಟಿದೆ`) + `\n\n` +
            `🛒 ಖರೀದಿ ಆಯ್ಕೆಗಳು:\n` +
            `• Zepto - ತ್ವರಿತ ವಿತರಣೆ\n` +
            `• BigBasket - ಬಲ್ಕ್ ಆರ್ಡರ್‌ಗಳಿಗಾಗಿ\n` +
            `• JioMart - ಕೈಗೆಟುಕುವ ಆಯ್ಕೆ\n\n` +
            `💡 ವಿಶೇಷ ಸಲಹೆಗಳು:\n` +
            `• ಸುರಕ್ಷತಾ ದಾಸ್ತಾನು: ${safetyStock} ಘಟಕಗಳು\n` +
            `• ಆದೇಶದ ಸರಿಯಾದ ಸಮಯ: ದಾಸ್ತಾನು ${reorderPoint} ಘಟಕಗಳಿಗೆ ತಲುಪಿದಾಗ\n` +
            `• ದೈನಂದಿನ ಸರಾಸರಿ ಮಾರಾಟವನ್ನು ಗಮನಿಸಿ`;
          break;
        
        default: // English
          reasoning = `Smart Inventory Analysis for ${productName} 📊\n\n` +
            `🔍 Current Situation:\n` +
            `• Stock: ${currentInventory} units (${Math.round(inventoryRunoutDays)} days remaining)\n` +
            `• Sales: ${salesVelocity} units per day\n` +
            `• Delivery Time: ${leadTimeDays} days\n\n` +
            `⚡ Immediate Action:\n` +
            (suggestedOrderQuantity > 0 
              ? `✓ Order ${suggestedOrderQuantity} units now\n` +
                `✓ Estimated Cost: ₹${suggestedOrderQuantity * 50} (at avg. rate)\n` +
                `✓ Order soon - stock below ${reorderPoint} units threshold`
              : `✓ No immediate order needed\n` +
                `✓ Next order at ${reorderPoint} units\n` +
                `✓ Current stock is sufficient`) + `\n\n` +
            `🛒 Procurement Options:\n` +
            `• Zepto - For immediate delivery\n` +
            `• BigBasket - For bulk orders\n` +
            `• JioMart - For economical options\n\n` +
            `💡 Pro Tips:\n` +
            `• Keep safety stock of ${safetyStock} units\n` +
            `• Best time to order: when stock hits ${reorderPoint} units\n` +
            `• Track average daily sales trends`;
      }

      return {
        output: {
          suggestedOrderQuantity,
          reasoning,
          inventoryRunoutDays,
          suggestedApps
        }
      };
    };
  }

  defineTool<U extends z.ZodType>(
    def: ToolDefinition<U>,
    handler: () => Promise<z.infer<U>>
  ) {
    return handler;
  }

  async generate(options: GenerateOptions) {
    // Convert text to speech using a real API
    const text = options.prompt;
    const language = options.config.speechConfig?.languageCode || 'en-US';
    
    // Use Azure Cognitive Services Text-to-Speech API
    const response = await fetch('https://eastus.tts.speech.microsoft.com/cognitiveservices/v1', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/ssml+xml',
        'X-Microsoft-OutputFormat': 'audio-16khz-128kbitrate-mono-mp3',
        'Authorization': 'Bearer YOUR_AZURE_TOKEN',
      },
      body: `<speak version='1.0' xmlns='http://www.w3.org/2001/10/synthesis' xml:lang='${language}'>
        <voice name='${options.config.speechConfig?.voiceConfig.prebuiltVoiceConfig.voiceName || 'en-US-JennyNeural'}'>
          ${text}
        </voice>
      </speak>`,
    });

    const audioData = await response.arrayBuffer();
    const base64Audio = Buffer.from(audioData).toString('base64');
    
    return {
      media: {
        url: `data:audio/mp3;base64,${base64Audio}`,
      },
    };
  }
}

export const ai = new GenKit();
