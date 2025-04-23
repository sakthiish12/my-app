import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { neon, neonConfig } from '@neondatabase/serverless';

export const runtime = 'nodejs';
export const maxDuration = 10; // Extend timeout to 10 seconds

// Configure Neon to use SSL
neonConfig.fetchConnectionCache = true;

// Initialize Neon client with the pooled connection
const sql = neon(process.env.DATABASE_URL!);

// Ensure table exists
sql`
  CREATE TABLE IF NOT EXISTS daily_prompts (
    id SERIAL PRIMARY KEY,
    prompt TEXT NOT NULL,
    date DATE NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
  )
`.catch(error => {
  console.error('Error creating table:', error);
  // Table might already exist, so we can continue
});

export async function POST() {
  try {
    const now = new Date();
    const today = now.toISOString().split('T')[0];

    // Try to get today's prompt from the database
    const existingPrompt = await sql`
      SELECT prompt FROM daily_prompts 
      WHERE date = ${today}::date
      LIMIT 1
    `;
    
    if (existingPrompt.length > 0) {
      return NextResponse.json({ prompt: existingPrompt[0].prompt });
    }

    // If not in database, generate new prompt
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

Generate ONE powerful question that MUST be under 40 words total. The question should force deep reflection on hidden behaviors, excuses, or limiting beliefs. Your tone can be sharp, gentle, or curious—but always insightful.

Once I answer, provide a concise coaching analysis that:
1. Identifies limiting beliefs or self-sabotage patterns
2. Calls out blind spots honestly
3. Offers one actionable mindset shift

Stay direct and impactful. Challenge perspective, spark growth—never comfort.`
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

    try {
      // Store in database
      await sql`
        INSERT INTO daily_prompts (prompt, date)
        VALUES (${generatedPrompt}, ${today}::date)
      `;
    } catch (dbError) {
      console.error('Error storing prompt in database:', dbError);
      // Even if storage fails, return the generated prompt
      return NextResponse.json({ prompt: generatedPrompt });
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