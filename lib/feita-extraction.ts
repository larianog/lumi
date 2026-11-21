const DEFAULT_FEITA_URL = 'https://api.feita.ai/gateway/v1/chat/completions';
const EXTRACTION_TIMEOUT_MS = 60_000;
const MAX_EXTRACTED_TEXT_LENGTH = 120_000;

export const MATERIAL_EXTRACTION_PROMPT_VERSION = 'material-text-v1';

const MATERIAL_EXTRACTION_PROMPT = `Extraia todo o texto visível desta imagem de material escolar.
Preserve a ordem de leitura, títulos, listas, numeração e quebras de linha importantes.
Não responda perguntas, não resolva exercícios, não resuma e não acrescente explicações.
Quando um trecho não puder ser lido com segurança, escreva [ilegível].
Retorne somente o texto extraído.`;

type FeitaContent = string | Array<{ type?: string; text?: string }>;

type FeitaResponse = {
  choices?: Array<{
    message?: {
      content?: FeitaContent;
    };
  }>;
};

export class MaterialExtractionError extends Error {
  constructor(
    public readonly code: 'CONFIGURATION' | 'PROVIDER' | 'TIMEOUT' | 'EMPTY_RESPONSE',
    message: string,
  ) {
    super(message);
    this.name = 'MaterialExtractionError';
  }
}

export function getFeitaModel() {
  const model = process.env.FEITA_AI_MODEL?.trim();
  if (!model) {
    throw new MaterialExtractionError('CONFIGURATION', 'FEITA_AI_MODEL must be set');
  }
  return model;
}

function readTextContent(content: FeitaContent | undefined) {
  if (typeof content === 'string') return content;
  if (!Array.isArray(content)) return '';
  return content.map((part) => part.text ?? '').join('\n');
}

export async function extractTextFromMaterial(
  bytes: Buffer,
  mimeType: string,
  fetchImpl: typeof fetch = fetch,
) {
  const apiKey = process.env.FEITA_AI_API_KEY?.trim();
  const model = getFeitaModel();
  const url = process.env.FEITA_AI_URL?.trim() || DEFAULT_FEITA_URL;

  if (!apiKey) {
    throw new MaterialExtractionError('CONFIGURATION', 'FEITA_AI_API_KEY must be set');
  }

  let response: Response;
  try {
    response = await fetchImpl(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        stream: false,
        temperature: 0,
        max_tokens: 4096,
        messages: [{
          role: 'user',
          content: [
            { type: 'text', text: MATERIAL_EXTRACTION_PROMPT },
            {
              type: 'image_url',
              image_url: { url: `data:${mimeType};base64,${bytes.toString('base64')}` },
            },
          ],
        }],
      }),
      signal: AbortSignal.timeout(EXTRACTION_TIMEOUT_MS),
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === 'TimeoutError') {
      throw new MaterialExtractionError('TIMEOUT', 'Feita extraction timed out');
    }
    throw new MaterialExtractionError('PROVIDER', 'Feita extraction request failed');
  }

  if (!response.ok) {
    throw new MaterialExtractionError('PROVIDER', `Feita extraction returned ${response.status}`);
  }

  let payload: FeitaResponse;
  try {
    payload = await response.json() as FeitaResponse;
  } catch {
    throw new MaterialExtractionError('PROVIDER', 'Feita extraction returned invalid JSON');
  }

  const extractedText = readTextContent(payload.choices?.[0]?.message?.content).trim();
  if (!extractedText) {
    throw new MaterialExtractionError('EMPTY_RESPONSE', 'Feita extraction returned no text');
  }

  return {
    model,
    text: extractedText.slice(0, MAX_EXTRACTED_TEXT_LENGTH),
  };
}
