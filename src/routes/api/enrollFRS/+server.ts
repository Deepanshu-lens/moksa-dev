import { VITE_POCKETBASE_URL } from "$env/static/private";
import type { RequestEvent, RequestHandler } from "./$types";

export const POST: RequestHandler = async ({
  locals,
  request,
}: RequestEvent) => {
  console.log("Enrolling");
  const requestData = await request.json();
  const { username, data } = requestData;
  console.log(data);
  await locals.pb?.collection("faceGallery").create({
    name: username,
    template: data.template,
    images: data.images,
    features: data.feature,
  });

  // await fetch(VITE_POCKETBASE_URL + "/api/updateGallery", {
  //   method: "POST",
  //   headers: {
  //     "Content-Type": "application/json",
  //   },
  // });

  return new Response(null, { status: 200 });
};
