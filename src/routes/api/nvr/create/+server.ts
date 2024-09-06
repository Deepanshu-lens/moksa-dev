
import type { RequestEvent, RequestHandler } from "./$types";

export const POST: RequestHandler = async ({
  locals,
  request,
  cookies
}: RequestEvent) => {
  console.log("Creating new node");
  console.log('cookies', cookies.get('moksa-token'))
  
  try {
    locals.pb?.autoCancellation(false);
    const data = await request.json();
    const { moksaId,host,nodeName, camCount, nvrSaving, nvrFace, name, node, ip, user_id, password, http_port,nvrPersonCount } = data;
    const result = await locals.pb?.collection("nvr").create({
      name,
      node,
      ip,
      user_id,
      password,
      http_port,
      ip_address: null
    });
    const token = cookies.get('moksa-token')
    console.log(token)
    const createCamera = async (i: number) => {
      const url = `rtsp://${user_id}:${password.includes('@') ? password.replace('@', '%40') : password}@${ip}:${http_port}/Streaming/channels/${i + 1}`;
      await fetch(`http://${host}/api/camera/addCamera`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `nvrCam ${i + 1}`,
          nodeId: node,
          save: nvrSaving,
          face: nvrFace,
          faceDetThresh: nvrFace ? 0.93 : null,
          faceMatchThresh: nvrFace ? 0.3 : null,
          saveDuration: nvrSaving ? 43200 : null,
          url: `${url}01`,
          subUrl: `${url}02`,
          running: false,
          runningThresh: null,
          saveFolder: nvrSaving ? `/Playback/` : null,
          priority: false,
          personCount: nvrPersonCount,
          cameraNumber: `${i+1}02`,
          moksaId: moksaId,
          token: token
        })
      });
    };

    for (let i = 0; i < parseInt(camCount); i++) {
      await createCamera(i);
    }

    const nodes = await locals.pb?.collection('node').getFullList();

    if (nodeName) {
      let currentNodeName = nodeName;
      while (currentNodeName) {
        const node = nodes.find((n) => n.name === currentNodeName);
        if (node) {
          await locals.pb?.collection('node').update(node.id, { "nvr+": [result?.id] });
          await locals.pb?.collection('nvr').update(result.id, { "node+": [node.id] });
        }
        const lastIndex = currentNodeName.lastIndexOf('_');
        if (lastIndex === -1) break;
        currentNodeName = currentNodeName.substring(0, lastIndex);
      }
    } else {
      console.log("No node found for the given node Id", data.nodeId);
    }

    return new Response(JSON.stringify({ node: result }), { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
  }
};