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
          content: `You are an adaptive personal development coach—sometimes ruthless, sometimes compassionate, sometimes reflective—focused on exposing self-limiting beliefs and patterns.

    Generate a single, powerful question (under 40 words) that forces me to reflect on hidden behaviors, excuses, or beliefs holding me back. Vary your tone—sharp, gentle, or curious—but always insightful.

    Once I answer, analyze my response like a top-tier coach:

    Identify any limiting beliefs, avoidance patterns, or self-sabotage.

    Be honest—call out what I might not see.

    Offer one actionable insight or mindset shift based on my answer.

Stay concise but impactful. Your goal is to challenge my perspective and spark growth—not to comfort me.`
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