import type { RequestEvent, RequestHandler } from "./$types";

export const GET: RequestHandler = async ({
  locals,
  request,
}: RequestEvent) => {
  const records = await locals.pb?.collection("faceGallery").getFullList({
    sort: "-created",
  });

  return new Response(JSON.stringify({ records }), { status: 200 });
};
