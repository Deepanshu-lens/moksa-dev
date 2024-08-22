import type { RequestEvent, RequestHandler } from "./$types";

export const POST: RequestHandler = async ({
  locals,
  request,
}: RequestEvent) => {
  console.log("Getting node data");
  const { session } = await request.json();
  const nodeData = await locals.pb?.collection("node").getFullList({
    filter: `session~"${session}"`,
  });
  if (nodeData) {
    for (let node of nodeData) {
      if (node.camera && Array.isArray(node.camera)) {
        let cameraData = [];
        for (let cameraId of node.camera) {
          let cameraDetails = await locals.pb
            ?.collection("camera")
            .getFullList({ filter: `id="${cameraId}"` });
          if (cameraDetails) {
            cameraData.push(cameraDetails);
          }
        }
        node.cameraData = cameraData;
      }
    }
  }

  return new Response(JSON.stringify({ nodeData }), { status: 200 });
};
