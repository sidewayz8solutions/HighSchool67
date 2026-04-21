import { corsHeaders } from '../_shared/cors.ts';

type DialogueRequest = {
  playerName: string;
  clique: string;
  npcName: string;
  npcClique: string;
  relationship: number;
  currentScene: string;
};

function isValidBody(body: unknown): body is DialogueRequest {
  if (!body || typeof body !== 'object') return false;
  const b = body as Record<string, unknown>;
  return (
    typeof b.playerName === 'string' &&
    b.playerName.length > 0 &&
    b.playerName.length <= 64 &&
    typeof b.clique === 'string' &&
    b.clique.length > 0 &&
    b.clique.length <= 32 &&
    typeof b.npcName === 'string' &&
    b.npcName.length > 0 &&
    b.npcName.length <= 64 &&
    typeof b.npcClique === 'string' &&
    b.npcClique.length > 0 &&
    b.npcClique.length <= 32 &&
    typeof b.relationship === 'number' &&
    Number.isInteger(b.relationship) &&
    b.relationship >= 0 &&
    b.relationship <= 100 &&
    typeof b.currentScene === 'string' &&
    b.currentScene.length > 0 &&
    b.currentScene.length <= 1000
  );
}

function jsonResponse(status: number, payload: unknown) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      ...corsHeaders,
      'content-type': 'application/json',
    },
  });
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return jsonResponse(405, { error: 'method_not_allowed' });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return jsonResponse(400, { error: 'invalid_json', message: 'Malformed JSON body' });
  }

  if (!isValidBody(body)) {
    return jsonResponse(400, {
      error: 'invalid_request',
      message: 'Request body failed validation',
    });
  }

  const openAiApiKey = Deno.env.get('OPENAI_API_KEY');
  if (!openAiApiKey) {
    return jsonResponse(500, {
      error: 'server_misconfigured',
      message: 'Missing OPENAI_API_KEY in function secrets',
    });
  }

  try {
    const prompt = `You are an NPC in a high school life sim.
NPC: ${body.npcName} (${body.npcClique})
Player: ${body.playerName} (${body.clique})
Relationship: ${body.relationship}/100
Scene: ${body.currentScene}
Return a single natural line of dialogue, max 25 words.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        authorization: `Bearer ${openAiApiKey}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'o4-mini',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 80,
        temperature: 0.85,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI request failed:', errorText);
      return jsonResponse(500, {
        error: 'ai_provider_error',
        message: 'Failed to generate dialogue',
      });
    }

    const data = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };

    const text = data.choices?.[0]?.message?.content?.trim();
    if (!text) {
      return jsonResponse(500, {
        error: 'empty_response',
        message: 'AI returned empty dialogue',
      });
    }

    return jsonResponse(200, { text });
  } catch (error) {
    console.error('Dialogue function error:', error);
    return jsonResponse(500, {
      error: 'internal_error',
      message: 'Unexpected server error',
    });
  }
});
