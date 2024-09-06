
import { VITE_POCKETBASE_URL } from "$env/static/private";
import type { RequestEvent, RequestHandler } from "./$types";

export const POST: RequestHandler = async ({
  locals,
  request,
  cookies   
}: RequestEvent) => {
  console.log("Adding Camera");
  const mToken  = cookies.get('moksa-token')
  console.log(mToken)
  locals.pb?.autoCancellation(false);
  const data = await request.json();
  try {
  const inference = await locals.pb?.collection('ai_inference').create({
    // camera: camera.id,
    node: data.nodeId,
    session: data.sessionId,
    face: data.face,
    vehicle: data.vehicle,
    faceDetThresh: data.faceDetThresh,
    faceMatchThresh: data.faceMatchThresh,
    vehicleDetThresh: data.vehDetThresh,
    vehiclePlateThresh: data.vehPlateThresh,
    vehicleOCRThresho: data.vehOCRThresh,
    motionThresh: data.motionThresh,
    running: data.running,
    runningThresh: data.runningThresh
  })

  const camera = await locals.pb?.collection("camera").create({
    name: data.name,
    url: data.url,
    subUrl: data.subUrl,
    node: data.nodeId,
    save: data.save,
    saveDuration: data.saveDuration,
    saveFolder: data.saveFolder,
    personCount: data.personCount,
    inference: inference.id,
    cameraNo: Number(data.cameraNumber),
  });

  console.log("CAMERA ADDED ", camera);

  await locals.pb?.collection('ai_inference').update(inference.id, {
    "camera+": [camera.id]
  })
  // console.log(data.nodeId);

  const nodes = await locals.pb?.collection("node").getFullList();
  // console.log("NODES", nodes);
  // const nodeMap = new Map(nodes?.map((node) => [node.name, node.id]));
  const initialNode = nodes?.find((node) => node.id === data.nodeId);
  let nodeName = initialNode ? initialNode.name : null;

  // console.log(nodeName);

  if (nodeName) {
    while (nodeName) {
      const node = nodes?.find((n) => n.name === nodeName);
      if (node) {
        await locals.pb?.collection("node").update(node.id, {
          "camera+": [camera?.id],
        });
        await locals.pb?.collection("camera").update(camera.id, {
          "node+": [node?.id],
        });
      }
      const lastIndex = nodeName.lastIndexOf("_");
      if (lastIndex === -1) break;
      nodeName = nodeName.substring(0, lastIndex);
    }
  } else {
    console.error("Node not found for the given nodeId:", data.nodeId);
  }
console.log('cookie,token',mToken)
console.log('payload',data.token)
console.log(data.moksaId)
console.log(data.cameraNumber)
console.log(data.url.split('@')[1])

const tokenToUse = mToken === undefined ? data.token : mToken

  await Promise.all([
    fetch(`${VITE_POCKETBASE_URL}/api/addStream`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }),
    fetch(`https://api.moksa.ai/camera/addCamera`, {
      method: "POST",
      headers: { "Content-Type": "application/json",
        'Authorization': `Bearer ${tokenToUse}`,
       },
      body: JSON.stringify({
        port: 554,
        vendor: 'company',
        streaming_url: data.url,
        ip: data.url.split('@')[1].split(':')[0],
        store_id: data.moksaId,
        cameraNo: Number(data.cameraNumber),
        lensCameraId: camera.id
      }),
    }).then(async(res) => {
      if (!res.ok) {
        throw new Error(`Moksa API error: ${res.status} ${res.statusText}`);
      }
      const moksaData = await res.json();
      console.log("Moksa API response:", moksaData);
      
      // Update PocketBase camera with Moksa ID
      if (moksaData.id) {
        await locals.pb?.collection("camera").update(camera.id, {
          cameraId: moksaData.id
        });
        console.log("Updated PocketBase camera with Moksa ID:", moksaData.id);
      } else {
        console.warn("Moksa API response doesn't contain an ID");
      }
    }).catch((err) => {
      console.log(err);
    })
  ]);

  return new Response(null, { status: 200 });
  } catch (error) {
    console.log(error);
    console.error("Error adding camera:", error);
    return new Response(null, { status: 500 });
  }
};