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

    const manager = await context.env.DB.prepare(
      `SELECT u.id, u.name, u.phone, u.role, u.service_center_id, 
              s.name as center_name, s.location as center_location, s.type as center_type, 
              s.contact as center_contact, s.address as center_address
       FROM users u
       JOIN service_centers s ON u.service_center_id = s.id
       WHERE u.pin = ? AND u.status = 'active'`
    ).bind(pin).first();

    if (!manager) {
      return new Response(JSON.stringify({ error: "Invalid PIN or manager inactive" }), {
        status: 401,
        headers: { "Content-Type": "application/json" }
      });
    }

    return new Response(JSON.stringify({
      manager: {
        id: manager.id,
        name: manager.name,
        phone: manager.phone,
        role: manager.role,
        serviceCenterId: manager.service_center_id
      },
      center: {
        id: manager.service_center_id,
        name: manager.center_name,
        location: manager.center_location,
        type: manager.center_type,
        contact: manager.center_contact,
        address: manager.center_address
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
