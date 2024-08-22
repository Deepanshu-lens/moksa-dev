import { redirect } from "@sveltejs/kit";
import { VITE_POCKETBASE_URL } from "$env/static/private";
import type { RequestEvent, RequestHandler } from "./$types";
import type { Camera } from "@/types";

export const DELETE: RequestHandler = async ({
  locals,
  request,
}: RequestEvent) => {
  const data = await request.json();
  // First, Delete all Cameras
  console.log(data.cameras);
  await Promise.all(
    data.cameras.map(async (camera: Camera) => {
      await Promise.all([
        locals.pb?.collection("camera").delete(camera.id),
        fetch(VITE_POCKETBASE_URL + "/api/deleteStream", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(camera),
        }),
      ]);
    }),
  );

  await locals.pb?.collection("node").delete(data.nodeId);
  return new Response(null, { status: 200 });
};
