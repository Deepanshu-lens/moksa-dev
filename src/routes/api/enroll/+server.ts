import { VITE_POCKETBASE_URL } from "$env/static/private";
import type { RequestEvent, RequestHandler } from "./$types";

export const POST: RequestHandler = async ({
  locals,
  request
}: RequestEvent) => {
  console.log("Enrolling");
  const requestData = await request.json();
  const { username, data } = requestData;

  const sumFeature = new Array(512).fill(0);
  data.map((item: any) => {
    console.log(item);
    for (let i = 0; i < 512; i++) {
      sumFeature[i] += item.bboxes[0].Feature[i];
    }
  });
  const template = sumFeature.map((sum) => sum / data.length);

  const gallery = await locals.pb?.collection("faceGallery").create({
    name: username,
    template,
    images: data.map((item: any) => item.bboxes[0].Image),
    features: data.map((item: any) => item.bboxes[0].Feature),
  });

  //   const camera = await locals.pb?.collection("camera").create({
  //     name: data.name,
  //     url: data.url,
  //   });

  //   await locals.pb?.collection("node").update(data.nodeId, {
  //     "camera+": [camera.id],
  //   });
  await fetch(VITE_POCKETBASE_URL + "/api/updateGallery", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });

  return new Response(null, { status: 200 });
};
