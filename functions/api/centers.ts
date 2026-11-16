interface Env {
  DB: any;
}

export const onRequestGet = async (context: { env: Env }) => {
  try {
    if (!context.env.DB) {
      return new Response(JSON.stringify({ error: "Cloudflare D1 binding 'DB' not configured" }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }

    const { results } = await context.env.DB.prepare(
      "SELECT * FROM service_centers ORDER BY created_at DESC"
    ).all();

    return new Response(JSON.stringify(results), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};

export const onRequestPost = async (context: { request: Request; env: Env }) => {
  try {
    if (!context.env.DB) {
      return new Response(JSON.stringify({ error: "Cloudflare D1 binding 'DB' not configured" }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }

    const data = await context.request.json() as any;
    const id = `sc-${data.type}-${Date.now().toString(36)}`;

    await context.env.DB.prepare(
      `INSERT INTO service_centers (id, name, location, type, contact, email, address)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      id,
      data.name,
      data.location,
      data.type,
      data.contact || null,
      data.email || null,
      data.address
    ).run();

    return new Response(JSON.stringify({ id, ...data }), {
      status: 201,
      headers: { "Content-Type": "application/json" }
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};
