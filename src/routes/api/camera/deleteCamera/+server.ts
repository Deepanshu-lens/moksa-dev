import { redirect } from "@sveltejs/kit";
import { VITE_POCKETBASE_URL } from "$env/static/private";
import type { RequestEvent, RequestHandler } from "./$types";

export const DELETE: RequestHandler = async ({
  locals,
  request,
}: RequestEvent) => {
  const data = await request.json();
  await locals.pb?.collection("camera").delete(data.cameraId);
  await fetch(VITE_POCKETBASE_URL + "/api/deleteStream", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  return new Response(null, { status: 200 });
};
