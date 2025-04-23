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

export async function POST(request: Request) {
  try {
    const { regenerate } = await request.json();
    const now = new Date();
    const today = now.toISOString().split('T')[0];

    // Try to get today's prompt from the database
    const existingPrompt = await sql`
      SELECT prompt FROM daily_prompts 
      WHERE date = ${today}::date
      LIMIT 1
    `;
    
    if (existingPrompt.length > 0 && !regenerate) {
      return NextResponse.json({ prompt: existingPrompt[0].prompt });
    }

    // If not in database or regenerate is true, generate new prompt
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
You are a creative assistant that generates ONLY a single meta-prompt in this EXACT format:
"Ask me [specific situation/behavior], After I answer, [specific action] and provide one [specific change]."

Key requirements:
1. MUST start with "Ask me"
2. Sometimes include "After I answer"
3. Sometimes end with providing ONE specific mindset shift or action step
4. Sometimes be in quotation marks
5. Sometimes be a single sentence under 50 words
6. MUST NOT include any analysis, explanations, or additional text

Vary these tones randomly:
- Ruthless: Direct and confrontational
- Compassionate: Supportive yet honest
- Curious: Thought-provoking
- Humorous: Playful but insightful

Examples of CORRECT format:
"Ask me what goal I keep postponing because I'm 'not ready.' After I answer, challenge my excuses and provide one mindset shift to help me take action now."

"Ask me where I'm playing it safe but calling it smart. After I answer, call me out and give me one mindset shift to get moving."

CRITICAL: Return ONLY the quoted meta-prompt. No explanations. No analysis. No additional text.`
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
      if (regenerate) {
        // Update existing prompt
        await sql`
          UPDATE daily_prompts 
          SET prompt = ${generatedPrompt}
          WHERE date = ${today}::date
        `;
      } else {
        // Insert new prompt
        await sql`
          INSERT INTO daily_prompts (prompt, date)
          VALUES (${generatedPrompt}, ${today}::date)
        `;
      }
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