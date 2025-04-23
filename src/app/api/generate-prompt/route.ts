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
          content: `You are a creative self-development assistant.

Your task is to generate a SINGLE meta-prompt that users can copy-paste into ChatGPT to help them uncover limiting beliefs and receive personalized coaching feedback.

Each time, vary the TONE:
- Sometimes **ruthless** (direct, no-nonsense, brutally honest)
- Sometimes **compassionate** (supportive, understanding, gentle push)
- Sometimes **curious** (philosophical, reflective)
- Sometimes **humorous** (light-hearted but still insightful)

The meta-prompt should:
1. Ask ChatGPT to generate a deep, challenging question to expose limiting beliefs or self-sabotage.
2. Instruct ChatGPT to wait for the user's answer.
3. Then, tell ChatGPT to analyze the answer like a coach and provide ONE mindset shift.

Requirements:
- Keep it under 50 words.
- Make it engaging and clear.
- Reflect the chosen tone naturally.
- Output ONLY the meta-prompt, no extra text.

Example (Ruthless):
"Ask me a brutal question that exposes where I'm holding myself back. After I answer, call out my excuses and give me one mindset shift to get over myself."

Example (Compassionate):
"Ask me a gentle question to help me see a limiting belief I'm carrying. Once I answer, kindly guide me with one mindset shift to move forward."

Example (Humorous):
"Ask me a funny-but-true question that points out how I'm sabotaging myself. After I answer, roast me lightly and give me one helpful mindset tweak."

Randomly choose the tone each time.`
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