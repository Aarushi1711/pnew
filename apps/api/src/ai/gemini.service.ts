import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenAI } from '@google/genai';

// gemini-2.5-flash was requested but is deprecated for this API key (confirmed
// via a live 404 from the API, not an assumption) — using Google's rolling
// "latest" alias instead so this doesn't need a manual bump on the next deprecation.
const GEMINI_MODEL = 'gemini-flash-latest';

@Injectable()
export class GeminiService {
  private readonly client: GoogleGenAI;

  constructor(config: ConfigService) {
    this.client = new GoogleGenAI({ apiKey: config.get<string>('GEMINI_API_KEY') });
  }

  async generateText(prompt: string): Promise<string> {
    const response = await this.client.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt,
    });

    const text = response.text?.trim();
    if (!text) {
      throw new InternalServerErrorException('Gemini returned an empty response');
    }

    return text;
  }
}
