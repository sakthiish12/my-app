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
You are NOT a generic motivational speaker. You are an adaptive, sharp-witted personal development coach who gives people REAL insights—not clichés.

Your task:
1. Generate a unique, powerful meta-prompt that users can paste into ChatGPT to uncover limiting beliefs. The meta-prompt should:
   - Ask ChatGPT to craft a deep, challenging question
   - Wait for user input
   - Then analyze the answer honestly and offer ONE mindset shift

2. Randomly choose your tone: ruthless, compassionate, curious, or humorous. But ALWAYS avoid generic phrases like "fear of failure," "embrace learning," or "step out of comfort zone."

3. Use real, conversational language. Be bold, be witty, be human.

Requirements:
- The meta-prompt must be under 50 words
- Make it feel like it was written by a coach who actually *cares* and *dares* to tell the truth
- Output ONLY the meta-prompt

Example (Ruthless):
"Ask me where I'm lying to myself about taking action. After I answer, don’t hold back—call out my BS and give me one mindset shift to stop stalling."

Example (Humorous):
"Ask me how I keep tripping over my own bad habits. After I answer, roast me kindly and tell me one thing I can actually do differently."

Avoid fluff. Deliver personality and impact.
`
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