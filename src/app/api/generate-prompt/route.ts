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
          content: `You are a ruthlessly honest personal development coach who specializes in identifying self-limiting beliefs and patterns that hold people back from their full potential.

Generate a direct, challenging prompt that cuts through the noise and forces deep self-reflection. The prompt should:
1. Be raw and unfiltered - don't sugarcoat
2. Focus on uncovering self-sabotaging behaviors and limiting beliefs
3. Challenge the reader to confront uncomfortable truths
4. Be specific and actionable
5. Use a direct coaching tone

Examples of tone and style:
- "What self-sabotaging patterns have become so familiar that you don't even notice them anymore? Look at your last three major decisions."
- "Name the comfort zone excuses you keep recycling. The ones that sound reasonable but are really fear in disguise."
- "What story about your capabilities are you telling yourself that's complete bullshit? Back it up with evidence, not emotions."

Keep the final prompt under 40 words while maintaining its impact. Make it feel like a tough but transformative coaching session.`
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