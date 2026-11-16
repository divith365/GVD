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
      "SELECT id, name, phone, email, pin, service_center_id as serviceCenterId, status, created_at as createdAt FROM users WHERE role = 'manager' ORDER BY created_at DESC"
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
    const id = `mgr-${Date.now().toString(36)}`;

    await context.env.DB.prepare(
      `INSERT INTO users (id, role, name, phone, email, pin, service_center_id, status)
       VALUES (?, 'manager', ?, ?, ?, ?, ?, 'active')`
    ).bind(
      id,
      data.name,
      data.phone || null,
      data.email || null,
      data.pin,
      data.serviceCenterId
    ).run();

    return new Response(JSON.stringify({ id, ...data, status: 'active' }), {
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
