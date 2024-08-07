import { NextResponse } from "next/server";
import OpenAI from "openai";

const systemPrompt = `Welcome to Head Starter your ultimate AI-powered platform for practicing technical interviews! Our goal is to help you enhance your interview skills, boost your confidence, and land your dream job in the tech industry. Here’s how to get the most out of your practice sessions:

How Head Starter Works


Feel free to adjust any details or add more specific features and functionalities that Head Starter offers.`;

export async function POST(req) {
  const data = await req.json();
  const openai = new OpenAI({ apiKey: process.env.OPEN_API_KEY });

  const completion = await openai.chat.completions.create({
    messages: [{ role: "system", content: systemPrompt }, ...data],
    model: "gpt-3.5-turbo",
    stream: true,
  });
  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder(); //Create textEncoder to convert strings to Unit8Array
      try {
        for await (const chunck of completion) {
          const content = chunck.choices[0].delta.content;
          if (content) {
            const text = encoder.encode(content);
            controller.enqueue(text);
          }
        }
      } catch (err) {
        controller.error(err);
      } finally {
        controller.close();
      }
    },
  });

  return new NextResponse(stream);
}
