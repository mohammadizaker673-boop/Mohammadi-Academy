type AIMessageRole = 'system' | 'user' | 'assistant';

export type AIMessage = {
  role: AIMessageRole;
  content: string;
};

type AITextRequest = {
  messages: AIMessage[];
  model?: string;
  temperature?: number;
  maxTokens?: number;
  jsonMode?: boolean;
};

const OPENROUTER_ENDPOINT = 'https://openrouter.ai/api/v1/chat/completions';
const DEFAULT_MODEL = 'openai/gpt-4o-mini';
const DEFAULT_APP_NAME = 'Mohammadi Academy';

const getOpenRouterApiKey = (): string => import.meta.env.VITE_OPENROUTER_API_KEY?.trim() || '';

const getOpenRouterModel = (): string => import.meta.env.VITE_OPENROUTER_MODEL?.trim() || DEFAULT_MODEL;

const getOpenRouterTitle = (): string => import.meta.env.VITE_OPENROUTER_APP_NAME?.trim() || DEFAULT_APP_NAME;

const getOpenRouterSiteUrl = (): string => {
  const configuredSiteUrl = import.meta.env.VITE_OPENROUTER_SITE_URL?.trim();

  if (configuredSiteUrl) {
    return configuredSiteUrl;
  }

  if (typeof window !== 'undefined') {
    return window.location.origin;
  }

  return '';
};

const extractResponseText = (content: unknown): string => {
  if (typeof content === 'string') {
    return content.trim();
  }

  if (Array.isArray(content)) {
    return content
      .map((part) => {
        if (typeof part === 'string') {
          return part;
        }

        if (part && typeof part === 'object' && 'text' in part) {
          const text = (part as { text?: unknown }).text;
          return typeof text === 'string' ? text : '';
        }

        return '';
      })
      .join('\n')
      .trim();
  }

  return '';
};

const extractJsonObject = <T,>(text: string): T => {
  const trimmed = text.trim();
  const withoutFence = trimmed
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();

  try {
    return JSON.parse(withoutFence) as T;
  } catch {
    const firstBrace = withoutFence.indexOf('{');
    const lastBrace = withoutFence.lastIndexOf('}');

    if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
      throw new Error('AI response did not include a valid JSON object.');
    }

    return JSON.parse(withoutFence.slice(firstBrace, lastBrace + 1)) as T;
  }
};

const buildHeaders = (apiKey: string): HeadersInit => {
  const headers: Record<string, string> = {
    Authorization: `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
    'X-OpenRouter-Title': getOpenRouterTitle(),
  };

  const siteUrl = getOpenRouterSiteUrl();
  if (siteUrl) {
    headers['HTTP-Referer'] = siteUrl;
  }

  return headers;
};

export const hasOpenRouterApiKey = (): boolean => Boolean(getOpenRouterApiKey());

export const generateAIText = async ({
  messages,
  model,
  temperature = 0.3,
  maxTokens = 900,
  jsonMode = false,
}: AITextRequest): Promise<string> => {
  const apiKey = getOpenRouterApiKey();

  if (!apiKey) {
    throw new Error('OpenRouter API key is not configured.');
  }

  const response = await fetch(OPENROUTER_ENDPOINT, {
    method: 'POST',
    headers: buildHeaders(apiKey),
    body: JSON.stringify({
      model: model || getOpenRouterModel(),
      messages,
      temperature,
      max_tokens: maxTokens,
      ...(jsonMode ? { response_format: { type: 'json_object' } } : {}),
    }),
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(payload?.error?.message || payload?.message || `OpenRouter request failed with status ${response.status}.`);
  }

  const text = extractResponseText(payload?.choices?.[0]?.message?.content);

  if (!text) {
    throw new Error('OpenRouter returned an empty response.');
  }

  return text;
};

export const generateAIJson = async <T,>(request: AITextRequest): Promise<T> => {
  const text = await generateAIText({
    ...request,
    jsonMode: true,
    messages: [
      {
        role: 'system',
        content: 'Return valid JSON only. Do not wrap the response in markdown fences and do not add explanatory text outside the JSON object.',
      },
      ...request.messages,
    ],
  });

  return extractJsonObject<T>(text);
};