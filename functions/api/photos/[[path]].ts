interface Env {
  PHOTOS_BUCKET: any;
}

export const onRequestGet = async (context: { params: { path: string[] }; env: Env }) => {
  try {
    if (!context.env.PHOTOS_BUCKET) {
      return new Response("R2 bucket binding not configured", { status: 500 });
    }

    const pathArray = context.params.path || [];
    const objectKey = pathArray.join("/");

    if (!objectKey) {
      return new Response("Missing photo path", { status: 400 });
    }

    const object = await context.env.PHOTOS_BUCKET.get(objectKey);

    if (!object) {
      return new Response("Photo not found", { status: 404 });
    }

    const headers = new Headers();
    object.writeHttpMetadata(headers);
    headers.set("etag", object.httpEtag);
    headers.set("Cache-Control", "public, max-age=31536000, immutable");

    return new Response(object.body, { headers });
  } catch (err: any) {
    return new Response(err.message, { status: 500 });
  }
};

export const onRequestHead = onRequestGet;

