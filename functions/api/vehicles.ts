interface Env {
  DB: any;
}

export const onRequestGet = async (context: { request: Request; env: Env }) => {
  try {
    if (!context.env.DB) {
      return new Response(JSON.stringify({ error: "Cloudflare D1 binding 'DB' not configured" }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }

    const url = new URL(context.request.url);
    const centerId = url.searchParams.get("centerId");

    let query = "SELECT * FROM service_records";
    let params: any[] = [];

    if (centerId && centerId !== "all") {
      query += " WHERE service_center_id = ?";
      params.push(centerId);
    }

    query += " ORDER BY checkin_time DESC";

    const { results: records } = await context.env.DB.prepare(query).bind(...params).all();

    // Fetch photos for each record
    const vehicleRecords = await Promise.all(
      records.map(async (r: any) => {
        const { results: photos } = await context.env.DB.prepare(
          "SELECT stage, slot_key, public_url FROM inspection_photos WHERE record_id = ?"
        ).bind(r.id).all();

        const checkinPhotos: Record<string, string> = {};
        const checkoutPhotos: Record<string, string> = {};

        photos.forEach((p: any) => {
          if (p.stage === 'checkin') {
            checkinPhotos[p.slot_key] = p.public_url;
          } else if (p.stage === 'checkout') {
            checkoutPhotos[p.slot_key] = p.public_url;
          }
        });

        return {
          id: r.id,
          serviceCenterId: r.service_center_id,
          vehicleNumber: r.vehicle_number,
          vehicleType: r.vehicle_type,
          serviceType: r.service_type,
          customerName: r.customer_name,
          customerPhone: r.customer_phone,
          status: r.status,
          managerId: r.manager_id,
          managerName: r.manager_name,
          checkinTime: r.checkin_time,
          checkoutTime: r.checkout_time,
          notes: r.notes,
          checkinPhotos,
          checkoutPhotos
        };
      })
    );

    return new Response(JSON.stringify(vehicleRecords), {
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
    const id = `veh-${data.vehicleType}-${Date.now().toString(36)}`;
    const now = new Date().toISOString();

    // 1. Insert vehicle record into D1
    await context.env.DB.prepare(
      `INSERT INTO service_records (
        id, service_center_id, vehicle_number, vehicle_type, service_type,
        customer_name, customer_phone, manager_id, manager_name, status, checkin_time, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'checked_in', ?, ?)`
    ).bind(
      id,
      data.serviceCenterId,
      data.vehicleNumber.toUpperCase().trim(),
      data.vehicleType,
      data.serviceType || null,
      data.customerName || null,
      data.customerPhone || null,
      data.managerId || null,
      data.managerName || null,
      now,
      data.notes || null
    ).run();

    // 2. Insert checkin photos into D1
    if (data.checkinPhotos) {
      for (const [slotKey, photoUrl] of Object.entries(data.checkinPhotos)) {
        const photoId = `photo-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
        await context.env.DB.prepare(
          `INSERT INTO inspection_photos (id, record_id, stage, slot_key, slot_label, r2_key, public_url)
           VALUES (?, ?, 'checkin', ?, ?, ?, ?)`
        ).bind(
          photoId,
          id,
          slotKey,
          slotKey,
          `r2-${slotKey}`,
          photoUrl as string
        ).run();
      }
    }

    return new Response(JSON.stringify({ id, ...data, checkinTime: now }), {
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

export const onRequestPut = async (context: { request: Request; env: Env }) => {
  try {
    if (!context.env.DB) {
      return new Response(JSON.stringify({ error: "Cloudflare D1 binding 'DB' not configured" }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }

    const data = await context.request.json() as any;
    const now = new Date().toISOString();

    // 1. Update vehicle record to checked_out
    await context.env.DB.prepare(
      `UPDATE service_records
       SET status = 'checked_out', checkout_time = ?, notes = COALESCE(?, notes)
       WHERE id = ?`
    ).bind(
      now,
      data.notes || null,
      data.id
    ).run();

    // 2. Insert checkout photos into D1
    if (data.checkoutPhotos) {
      for (const [slotKey, photoUrl] of Object.entries(data.checkoutPhotos)) {
        const photoId = `photo-out-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
        await context.env.DB.prepare(
          `INSERT INTO inspection_photos (id, record_id, stage, slot_key, slot_label, r2_key, public_url)
           VALUES (?, ?, 'checkout', ?, ?, ?, ?)`
        ).bind(
          photoId,
          data.id,
          slotKey,
          slotKey,
          `r2-checkout-${slotKey}`,
          photoUrl as string
        ).run();
      }
    }

    return new Response(JSON.stringify({ success: true, checkoutTime: now }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};

export const onRequestDelete = async (context: { request: Request; env: Env }) => {
  try {
    if (!context.env.DB) {
      return new Response(JSON.stringify({ error: "Cloudflare D1 binding 'DB' not configured" }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }

    const url = new URL(context.request.url);
    const id = url.searchParams.get("id");

    if (!id) {
      return new Response(JSON.stringify({ error: "Missing required parameter 'id'" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    // 1. Delete associated inspection photos
    await context.env.DB.prepare("DELETE FROM inspection_photos WHERE record_id = ?").bind(id).run();

    // 2. Delete service record
    await context.env.DB.prepare("DELETE FROM service_records WHERE id = ?").bind(id).run();

    return new Response(JSON.stringify({ success: true, deletedId: id }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};

