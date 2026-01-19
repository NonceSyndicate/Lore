/**
 * AI Provider Wrapper - Multi-Provider Fallback Chain
 * Priority: Groq → Google Gemini → OpenRouter → Mistral
 */

export interface AIResponse {
  content: string;
  model: string;
  provider: 'groq' | 'gemini' | 'openrouter' | 'mistral';
  tokensUsed?: number;
}

interface MessageParam {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

/**
 * Call Groq API (Primary - Fastest free tier)
 */
async function callGroq(
  messages: MessageParam[],
  systemPrompt: string,
): Promise<AIResponse | null> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return null;

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'mixtral-8x7b-32768',
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages,
        ],
        temperature: 0.7,
        max_tokens: 2048,
      }),
    });

    if (!response.ok) {
      console.warn(`Groq API error: ${response.status}`);
      return null;
    }

    const data = await response.json();
    return {
      content: data.choices[0]?.message?.content || '',
      model: data.model,
      provider: 'groq',
      tokensUsed: data.usage?.total_tokens,
    };
  } catch (error) {
    console.warn('Groq API call failed:', error);
    return null;
  }
}

/**
 * Call Google Gemini API (Secondary)
 */
async function callGemini(
  messages: MessageParam[],
  systemPrompt: string,
): Promise<AIResponse | null> {
  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  if (!apiKey) return null;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [
                { text: systemPrompt },
                ...messages.map(m => ({ text: m.content })),
              ],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 2048,
          },
        }),
      }
    );

    if (!response.ok) {
      console.warn(`Gemini API error: ${response.status}`);
      return null;
    }

    const data = await response.json();
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    return {
      content,
      model: 'gemini-pro',
      provider: 'gemini',
    };
  } catch (error) {
    console.warn('Gemini API call failed:', error);
    return null;
  }
}

/**
 * Call OpenRouter API (Tertiary - Multi-model)
 */
async function callOpenRouter(
  messages: MessageParam[],
  systemPrompt: string,
): Promise<AIResponse | null> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) return null;

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://noncesyndicate.com',
        'X-Title': 'Nonce Syndicate',
      },
      body: JSON.stringify({
        model: 'mistral/mistral-7b-instruct:free',
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages,
        ],
        temperature: 0.7,
        max_tokens: 2048,
      }),
    });

    if (!response.ok) {
      console.warn(`OpenRouter API error: ${response.status}`);
      return null;
    }

    const data = await response.json();
    return {
      content: data.choices[0]?.message?.content || '',
      model: data.model,
      provider: 'openrouter',
      tokensUsed: data.usage?.total_tokens,
    };
  } catch (error) {
    console.warn('OpenRouter API call failed:', error);
    return null;
  }
}

/**
 * Call Mistral API (Quaternary)
 */
async function callMistral(
  messages: MessageParam[],
  systemPrompt: string,
): Promise<AIResponse | null> {
  const apiKey = process.env.MISTRAL_API_KEY;
  if (!apiKey) return null;

  try {
    const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'mistral-small-latest',
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages,
        ],
        temperature: 0.7,
        max_tokens: 2048,
      }),
    });

    if (!response.ok) {
      console.warn(`Mistral API error: ${response.status}`);
      return null;
    }

    const data = await response.json();
    return {
      content: data.choices[0]?.message?.content || '',
      model: data.model,
      provider: 'mistral',
      tokensUsed: data.usage?.total_tokens,
    };
  } catch (error) {
    console.warn('Mistral API call failed:', error);
    return null;
  }
}

/**
 * Universal AI Provider with Fallback Chain
 * Tries each provider in order until one succeeds
 */
export async function callAI(
  userMessage: string,
  systemPrompt: string,
  conversationHistory?: MessageParam[],
): Promise<AIResponse> {
  const messages: MessageParam[] = [
    ...(conversationHistory || []),
    { role: 'user', content: userMessage },
  ];

  // Try providers in priority order
  const providers = [
    () => callGroq(messages, systemPrompt),
    () => callGemini(messages, systemPrompt),
    () => callOpenRouter(messages, systemPrompt),
    () => callMistral(messages, systemPrompt),
  ];

  for (const provider of providers) {
    const result = await provider();
    if (result) {
      console.log(`✅ AI Response via ${result.provider}`);
      return result;
    }
  }

  // Fallback if all providers fail
  console.warn('⚠️ All AI providers failed, returning mock response');
  return {
    content: `Failed to get AI response. Original request: ${userMessage}`,
    model: 'mock',
    provider: 'groq',
  };
}

/**
 * Parse mission context into AI-friendly format
 */
export function formatMissionPrompt(mission: any): string {
  const objectives = mission.context?.objectives || [];
  const budget = mission.context?.budget_limit_usd || 0;
  const tools = mission.context?.tools_available || [];

  return `
MISSION: ${mission.title}
PRIORITY: ${mission.priority?.toUpperCase() || 'NORMAL'}
STATUS: ${mission.status?.toUpperCase() || 'PENDING'}

OBJECTIVES:
${objectives.map((o: string, i: number) => `${i + 1}. ${o}`).join('\n')}

BUDGET: $${budget}
TOOLS AVAILABLE: ${tools.join(', ') || 'None specified'}

ASSIGNED TO: ${mission.assigned_to?.toUpperCase() || 'GENERAL'}
AUTONOMOUS: ${mission.context?.autonomous ? 'YES' : 'NO'}

Please provide a detailed execution plan with specific actions to take.
`;
}
