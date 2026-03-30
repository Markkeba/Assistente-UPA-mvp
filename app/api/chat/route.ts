import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/lib/supabase-server";
import { SYSTEM_PROMPT } from "@/lib/anthropic";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(req: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("subscription_status, trial_ends_at")
    .eq("id", user.id)
    .single();

  const isActive =
    profile?.subscription_status === "active" ||
    (profile?.subscription_status === "trial" &&
      new Date(profile.trial_ends_at) > new Date());

  if (!isActive) {
    return new Response("Subscription required", { status: 402 });
  }

  const { messages } = await req.json();

  // Create readable stream from Anthropic streaming
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      let fullOutput = "";

      try {
        const anthropicStream = anthropic.messages.stream({
          model: "claude-sonnet-4-20250514",
          max_tokens: 4096,
          system: SYSTEM_PROMPT,
          messages,
        });

        for await (const chunk of anthropicStream) {
          if (
            chunk.type === "content_block_delta" &&
            chunk.delta.type === "text_delta"
          ) {
            const text = chunk.delta.text;
            fullOutput += text;
            controller.enqueue(encoder.encode(text));
          }
        }

        const finalMessage = await anthropicStream.finalMessage();
        const tokensUsed = finalMessage.usage.input_tokens + finalMessage.usage.output_tokens;

        // Save consulta to database
        const userInput = messages[messages.length - 1]?.content || "";
        await supabase.from("consultas").insert({
          user_id: user.id,
          input: typeof userInput === "string" ? userInput : JSON.stringify(userInput),
          output: fullOutput,
          tokens_used: tokensUsed,
        });
      } catch (error) {
        controller.error(error);
        return;
      }

      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Transfer-Encoding": "chunked",
      "Cache-Control": "no-cache",
      "X-Accel-Buffering": "no",
    },
  });
}
