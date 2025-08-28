import OpenAI from 'openai';

const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) {
  console.warn('OPENAI_API_KEY is not set. API calls will fail.');
}

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'placeholder-key',
});

export async function generateText(prompt: string): Promise<ReadableStream<Uint8Array>> {
  const response = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [{ role: 'user', content: prompt }],
    stream: true,
  });

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of response) {
          const content = chunk.choices[0]?.delta?.content || '';
          if (content) {
            controller.enqueue(encoder.encode(content));
          }
        }
      } catch (error) {
        controller.error(error);
      } finally {
        controller.close();
      }
    },
  });

  return stream;
}

export async function generateImage(prompt: string, size: 512 | 768 = 512) {
  const response = await openai.images.generate({
    model: "dall-e-3",
    prompt,
    n: 1,
    size: size === 512 ? "1024x1024" : "1024x1024",
    response_format: "b64_json",
  });

  const base64Image = response.data?.[0]?.b64_json;
  if (!base64Image) {
    throw new Error('No image data received');
  }

  return Buffer.from(base64Image, 'base64');
}