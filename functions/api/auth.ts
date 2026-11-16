interface Env {
  DB: any;
}

export const onRequestPost = async (context: { request: Request; env: Env }) => {
  try {
    if (!context.env.DB) {
      return new Response(JSON.stringify({ error: "Cloudflare D1 binding 'DB' not configured" }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }

    const { pin } = await context.request.json() as { pin: string };

    if (!pin || pin.length < 6) {
      return new Response(JSON.stringify({ error: "Invalid PIN length" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    const user = await context.env.DB.prepare(
      `SELECT u.id, u.name, u.phone, u.role, u.service_center_id, 
              s.name as center_name, s.location as center_location, s.type as center_type, 
              s.contact as center_contact, s.address as center_address
       FROM users u
       LEFT JOIN service_centers s ON u.service_center_id = s.id
       WHERE u.pin = ? AND u.status = 'active'`
    ).bind(pin.trim()).first();

    if (!user) {
      return new Response(JSON.stringify({ error: "Invalid 8-digit PIN. Please try again." }), {
        status: 401,
        headers: { "Content-Type": "application/json" }
      });
    }

    if (user.role === 'admin') {
      return new Response(JSON.stringify({
        role: 'admin',
        name: user.name || 'Master Admin'
      }), {
        headers: { "Content-Type": "application/json" }
      });
    }

    return new Response(JSON.stringify({
      role: 'manager',
      name: user.name,
      managerId: user.id,
      serviceCenterId: user.service_center_id,
      serviceCenter: {
        id: user.service_center_id,
        name: user.center_name,
        location: user.center_location,
        type: user.center_type,
        contact: user.center_contact,
        address: user.center_address
      }
    }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};
