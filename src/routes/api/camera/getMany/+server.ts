import type { RequestEvent, RequestHandler } from "./$types";

export const POST: RequestHandler = async ({
  locals,
  request,
}: RequestEvent) => {
  const { nodeId } = await request.json();
  console.log(nodeId);
  const cameraData = await locals.pb?.collection("camera").getFullList({
    filter: `node="${nodeId}"`,
  });
  console.log(cameraData);

  return new Response(JSON.stringify({ cameraData }), { status: 200 });
};
