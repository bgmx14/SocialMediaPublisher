import OpenAI from 'openai';
import { config } from '../config';
import { AIGenerationRequest, SocialPlatform } from '../types';

const openai = new OpenAI({
  apiKey: config.openai.apiKey,
});

export class OpenAIService {
  static async generateCaption(request: AIGenerationRequest): Promise<string> {
    if (!config.openai.apiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const { prompt, context, platform, tone = 'casual', max_length } = request;

    const platformGuidelines: Record<SocialPlatform, string> = {
      instagram: 'Instagram post (use emojis, engaging, hashtags)',
      facebook: 'Facebook post (conversational, community-focused)',
      twitter: 'Twitter/X post (concise, max 280 characters, impactful)',
      linkedin: 'LinkedIn post (professional, business-focused, value-driven)',
    };

    const systemPrompt = `You are a social media content expert. Generate engaging captions for ${
      platform || 'social media'
    } posts.
Tone: ${tone}
${platform ? `Platform guidelines: ${platformGuidelines[platform]}` : ''}
${max_length ? `Maximum length: ${max_length} characters` : ''}`;

    const userPrompt = `${prompt || 'Create an engaging caption'}${
      context ? `\n\nContext: ${context}` : ''
    }`;

    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        max_tokens: 500,
        temperature: 0.8,
      });

      return completion.choices[0]?.message?.content?.trim() || '';
    } catch (error: any) {
      console.error('OpenAI API Error:', error);
      throw new Error(`Failed to generate content: ${error.message}`);
    }
  }

  static async enhanceContent(content: string, platform?: SocialPlatform): Promise<string> {
    if (!config.openai.apiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const systemPrompt = `You are a social media content optimizer. Enhance the given content to make it more engaging${
      platform ? ` for ${platform}` : ''
    }.
Keep the core message but improve readability, add appropriate emojis, and make it more compelling.`;

    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: content },
        ],
        max_tokens: 500,
        temperature: 0.7,
      });

      return completion.choices[0]?.message?.content?.trim() || content;
    } catch (error: any) {
      console.error('OpenAI API Error:', error);
      throw new Error(`Failed to enhance content: ${error.message}`);
    }
  }

  static async generateHashtags(content: string, count = 5): Promise<string[]> {
    if (!config.openai.apiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const prompt = `Generate ${count} relevant hashtags for this social media content. Return only the hashtags, one per line, without the # symbol:\n\n${content}`;

    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 200,
        temperature: 0.6,
      });

      const response = completion.choices[0]?.message?.content?.trim() || '';
      return response
        .split('\n')
        .map((tag) => tag.trim().replace(/^#/, ''))
        .filter(Boolean)
        .slice(0, count);
    } catch (error: any) {
      console.error('OpenAI API Error:', error);
      throw new Error(`Failed to generate hashtags: ${error.message}`);
    }
  }
}
