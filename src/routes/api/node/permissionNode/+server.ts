import type { RequestEvent, RequestHandler } from "./$types";

export const POST: RequestHandler = async ({
    locals,
    request,
  }: RequestEvent) => {
    try {
      const data = await request.json(); // Array of objects containing sessionId and nodeId
  
      await Promise.all(data.map(async (item: any) => {
        const { sessionId, nodeId } = item;
  
        const record = await locals.pb?.collection('session').update(sessionId, { "node": nodeId });
  
        await Promise.all(nodeId.map(async (node: any) => {
          const existingNode = await locals.pb?.collection('node').getOne(node);
  
          if (existingNode) {
            const updatedSessionData = {
              session: [...existingNode.session, sessionId], // Append new session ID
            };
  
            await locals.pb?.collection('node').update(node, updatedSessionData);
          }
        }));
      }));
  
      return new Response(JSON.stringify({ record: "success" }), {
        headers: { "Content-Type": "application/json" },
        status: 200,
      });
    } catch (error) {
      console.error("Failed to update node layout:", error);
      return new Response(
        JSON.stringify({ error: "Failed to update node layout" }),
        {
          headers: { "Content-Type": "application/json" },
          status: 500,
        },
      );
    }
  };