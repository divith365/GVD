interface Env {
  PHOTOS_BUCKET: any;
  R2_PUBLIC_DOMAIN?: string;
}

export const onRequestPost = async (context: { request: Request; env: Env }) => {
  try {
    if (!context.env.PHOTOS_BUCKET) {
      return new Response(JSON.stringify({ error: "Cloudflare R2 binding 'PHOTOS_BUCKET' not configured" }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }

    const { base64Data, vehicleNumber, slotKey, stage, vehicleType } = await context.request.json() as any;

    if (!base64Data) {
      return new Response(JSON.stringify({ error: "Missing image base64 data" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Extract base64 payload
    const matches = base64Data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    const contentType = matches ? matches[1] : 'image/webp';
    const buffer = Uint8Array.from(atob(matches ? matches[2] : base64Data), c => c.charCodeAt(0));

    // Determine extension based on content type (WebP preferred)
    let extension = 'webp';
    if (contentType.includes('jpeg') || contentType.includes('jpg')) {
      extension = 'jpg';
    } else if (contentType.includes('png')) {
      extension = 'png';
    }

    const cleanVNum = (vehicleNumber || 'VEHICLE').replace(/[^a-zA-Z0-9]/g, '_');
    const objectKey = `inspections/${cleanVNum}/${stage}/${slotKey}_${Date.now()}.${extension}`;

    // Save to Cloudflare R2 Bucket with metadata
    await context.env.PHOTOS_BUCKET.put(objectKey, buffer, {
      httpMetadata: {
        contentType: contentType,
        cacheControl: 'public, max-age=31536000, immutable'
      },
      customMetadata: {
        vehicleNumber: cleanVNum,
        stage: stage,
        slotKey: slotKey,
        vehicleType: vehicleType || 'car',
        compressedFormat: extension,
        byteSize: String(buffer.byteLength)
      }
    });

    // Public URL delivery
    const publicDomain = context.env.R2_PUBLIC_DOMAIN || '';
    const publicUrl = publicDomain
      ? `${publicDomain}/${objectKey}`
      : `/api/photos/${encodeURIComponent(objectKey)}`;

    return new Response(JSON.stringify({
      success: true,
      r2Key: objectKey,
      url: publicUrl,
      format: extension,
      bytes: buffer.byteLength
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};
