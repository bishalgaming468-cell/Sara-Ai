export default async (req, context) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return Response.json(
      { error: "API key not configured. Add GROQ_API_KEY in Netlify environment variables." },
      { status: 500 }
    );
  }

  try {
    const { messages } = await req.json();

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: messages,
        temperature: 0.7,
        max_tokens: 300
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error("Groq API error:", data);
      return Response.json(
        { error: data.error?.message || "AI service error" },
        { status: 500 }
      );
    }

    const reply = data.choices?.[0]?.message?.content || "Sorry, I couldn't process that.";

    return Response.json({ reply });
  } catch (err) {
    console.error("Function error:", err);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
};
