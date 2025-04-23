import { NextResponse } from 'next/server';
import OpenAI from 'openai';

export const runtime = 'edge';

export async function POST() {
  try {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const cacheKey = 'daily-prompt-' + today;

    // Try to get the prompt from cache first
    const cache = await caches.open('daily-prompt-cache');
    const cachedResponse = await cache.match(cacheKey);
    
    if (cachedResponse) {
      const data = await cachedResponse.json();
      return NextResponse.json({ prompt: data.prompt });
    }

    // If not in cache, generate new prompt
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

    // Store in cache
    const promptData = { prompt: generatedPrompt, date: today };
    await cache.put(
      cacheKey,
      new Response(JSON.stringify(promptData), {
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, s-maxage=86400' // Cache for 24 hours
        }
      })
    );
    
    return NextResponse.json({ prompt: generatedPrompt });
    
  } catch (error) {
    console.error('Error generating prompt:', error);
    return NextResponse.json(
      { error: 'Failed to generate prompt' },
      { status: 500 }
    );
  }
} 