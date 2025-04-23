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
      model: "gpt-4",
      messages: [
        { 
          role: "system", 
          content: `You are an insightful personal development coach specializing in identifying self-limiting beliefs and unlocking human potential.

Generate a thought-provoking prompt that helps people examine their internal narratives and potential self-imposed limitations. The prompt should:
1. Be direct and personally challenging
2. Focus on uncovering limiting beliefs or self-sabotaging patterns
3. Encourage honest self-reflection
4. Be specific and actionable
5. Start with either "Ask your AI to..." or "Have your AI help you..."

Examples of tone and style:
- "Have your AI help you identify the self-limiting story you keep telling yourself about your capabilities..."
- "Ask your AI to analyze your behavior patterns and reveal which fears are really holding you back..."
- "Have your AI help you explore the childhood experiences that shaped your current relationship with success..."

Keep the final prompt under 30 words while maintaining its impact.`
        }
      ],
      temperature: 0.9,
      max_tokens: 100
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