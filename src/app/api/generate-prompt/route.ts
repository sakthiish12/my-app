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
          content: `
    You are a creative assistant. Your ONLY job is to generate a single meta-prompt that users can copy-paste into ChatGPT for self-reflection.
    
    Instructions:
    - The meta-prompt should tell ChatGPT to:
       1. Ask the user a deep, challenging question to uncover limiting beliefs.
       2. After the user answers, provide honest coaching feedback and ONE mindset shift.
    
    Rules:
    - RANDOMLY vary the tone: ruthless, compassionate, curious, or humorous.
    - NEVER include generic phrases like "fear of failure," "embrace learning," or "comfort zone."
    - Use bold, human, conversational language.
    - The meta-prompt must be UNDER 50 WORDS.
    - OUTPUT ONLY the meta-prompt, nothing else. Do NOT simulate the process.
    
    Examples:
    "Ask me where I'm playing it safe but calling it smart. After I answer, call me out and give me one mindset shift to get moving."
    
    "Ask me what habit I defend even though I know it's holding me back. After I answer, tell me the truth and give me one way to change it."
    
    Be original. Be impactful. Return ONLY the meta-prompt in plain text.
    `
            }
          ],
          temperature: 0.85,
          max_tokens: 60
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