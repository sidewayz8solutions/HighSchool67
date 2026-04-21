const DEFAULT_TIMEOUT_MS = 10_000;

type DialoguePayload = {
  playerName: string;
  clique: string;
  npcName: string;
  npcClique: string;
  relationship: number;
  currentScene: string;
};

type DialogueApiResponse = {
  text?: string;
};

function getAiEndpoint(): string | null {
  const configured = process.env.EXPO_PUBLIC_AI_DIALOGUE_ENDPOINT?.trim();
  return configured && configured.length > 0 ? configured : null;
}

export async function generateDialogueFromApi(payload: DialoguePayload): Promise<string | null> {
  const endpoint = getAiEndpoint();
  if (!endpoint) return null;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    if (!response.ok) return null;
    const data = (await response.json()) as DialogueApiResponse;
    const text = data.text?.trim();
    return text && text.length > 0 ? text : null;
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}
