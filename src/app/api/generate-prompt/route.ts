import { NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function POST() {
  try {
    // Ensure OpenAI API key is set
    const openaiApiKey = process.env.OPENAI_API_KEY;
    
    if (!openaiApiKey) {
      console.error('OpenAI API key is missing');
      return NextResponse.json(
        { error: 'OpenAI API key is not configured' },
        { status: 500 }
      );
    }
    
    const openai = new OpenAI({
      apiKey: openaiApiKey,
    });
    
    // Generate the prompt with OpenAI
    const response = await openai.chat.completions.create({
      model: "gpt-4", // You can change this to gpt-3.5-turbo for lower cost
      messages: [
        { 
          role: "system", 
          content: "Generate a deeply personal prompt that speaks directly to the reader using 'you' phrasing. The prompt should invite self-reflection and encourage them to explore something meaningful about themselves, their life choices, or their personal values. Keep it thought-provoking, specific, and under 25 words. Start with 'Ask your AI about...' or 'Have your AI help you explore...'" 
        }
      ],
      temperature: 0.9,
      max_tokens: 60
    });
    
    // Extract the generated prompt
    const generatedPrompt = response.choices[0]?.message?.content?.trim();
    
    if (!generatedPrompt) {
      throw new Error('Failed to generate prompt');
    }
    
    return NextResponse.json({ prompt: generatedPrompt });
    
  } catch (error) {
    console.error('Error generating prompt:', error);
    return NextResponse.json(
      { error: 'Failed to generate prompt' },
      { status: 500 }
    );
  }
} 