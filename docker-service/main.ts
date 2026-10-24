
Deno.serve({ port: 3000, hostname: "0.0.0.0" }, async (req: Request): Promise<Response> => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers":
      "authorization, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };

  if (req.method === "OPTIONS") {
    return new Response(null, { headers });
  }

  if (req.method !== "POST") {
    return Response.json(
      { error: "Solo se permite POST" },
      { status: 405, headers },
    );
  }

  try {
    const body = await req.json();
    const texto = body.texto;

    if (typeof texto !== "string" || !texto.trim()) {
      return Response.json(
        { error: "Debes enviar un texto válido" },
        { status: 400, headers },
      );
    }

    const apiKey = Deno.env.get("ELEVENLABS_API_KEY");
    const voiceId = Deno.env.get("ELEVENLABS_VOICE_ID");

    if (!apiKey || !voiceId) {
      return Response.json(
        { error: "Faltan variables de entorno" },
        { status: 500, headers },
      );
    }

    const respuesta = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(voiceId)}?output_format=mp3_44100_128`,
      {
        method: "POST",
        headers: {
          "xi-api-key": apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: texto,
          model_id: "eleven_multilingual_v2",
        }),
      },
    );

    if (!respuesta.ok) {
      const error = await respuesta.text();
      console.error("Error de ElevenLabs:", error);

      return Response.json(
        { error: "No se pudo generar el audio" },
        { status: respuesta.status, headers },
      );
    }

    return new Response(respuesta.body, {
      status: 200,
      headers: {
        ...headers,
        "Content-Type": "audio/mpeg",
        "Content-Disposition": 'attachment; filename="audio.mp3"',
      },
    });
  } catch (error) {
    console.error(error);

    return Response.json(
      { error: "Error procesando la solicitud" },
      { status: 500, headers },
    );
  }
});
