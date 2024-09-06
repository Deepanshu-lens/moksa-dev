// import { redirect } from "@sveltejs/kit";
// import { VITE_POCKETBASE_URL } from "$env/static/private";
// import type { RequestEvent, RequestHandler } from "./$types";

// export const DELETE: RequestHandler = async ({
//   locals,
//   request,
//   cookies
// }: RequestEvent) => {
//   const data = await request.json();
//   const tokenToUse = cookies.get('moksa-token')
//   await locals.pb?.collection("camera").delete(data.cameraId);
//   await fetch(`https://api.moksa.ai/camera/deleteByStoreIdAndCameraId/${data.storeId}/${data.camId}`, {
//     method: 'POST', headers: {
//       'Content-Type': 'application/json',
//       'Authorization': `Bearer ${tokenToUse}`,
//     }
//   })
//   await fetch(VITE_POCKETBASE_URL + "/api/deleteStream", {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//     },
//     body: JSON.stringify(data),
//   });

//   return new Response(null, { status: 200 });
// };


import { redirect } from "@sveltejs/kit";
import { VITE_POCKETBASE_URL } from "$env/static/private";
import type { RequestEvent, RequestHandler } from "./$types";

export const DELETE: RequestHandler = async ({ locals, request, cookies }: RequestEvent) => {
  const data = await request.json();
  const { cameraId, storeId, camId } = await request.json();
  const tokenToUse = cookies.get('moksa-token');

  try {
    await Promise.all([
      locals.pb?.collection("camera").delete(cameraId),
      fetch(`https://api.moksa.ai/camera/deleteByStoreIdAndCameraId/${storeId}/${camId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tokenToUse}`,
        },
        body: JSON.stringify({ cameraId, storeId, camId }),
      }),
      fetch(`${VITE_POCKETBASE_URL}/api/deleteStream`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data }),
      })
    ]);

    return new Response(null, { status: 200 });
  } catch (error) {
    console.error('Error deleting camera:', error);
    return new Response(JSON.stringify({ error: 'Failed to delete camera' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};