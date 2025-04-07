// src/app/api/chat/route.js
import Groq from 'groq-sdk';

const groq = new Groq();

export async function POST(req) {
  try {
    // Parse the incoming JSON body
    const { messages } = await req.json();

    // Create the chat completion request with Groq
    const chatCompletion = await groq.chat.completions.create({
      messages: messages || [],
      model: "llama-3.3-70b-versatile",
      temperature: 1,
      max_completion_tokens: 1024,
      top_p: 1,
      stream: true,
      stop: null
    });

    // Create a ReadableStream to stream the response to the client
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of chatCompletion) {
            const data = chunk.choices[0]?.delta?.content || '';
            controller.enqueue(new TextEncoder().encode(data));
          }
          controller.close();
        } catch (error) {
          controller.error(error);
        }
      }
    });

    return new Response(stream, {
      headers: { 'Content-Type': 'text/plain' }
    });
  } catch (error) {
    console.error('Error during chat completion:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
