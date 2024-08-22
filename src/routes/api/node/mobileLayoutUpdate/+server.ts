import type { RequestEvent, RequestHandler } from "./$types";

export const POST: RequestHandler = async ({
  locals,
  request,
}: RequestEvent) => {
  const { nodeId, newValue } = await request.json();
  try {
    const updatedLayout = await locals.pb
      ?.collection("node")
      .update(nodeId, { mobileLayout: Number(newValue) });

    return new Response(JSON.stringify(updatedLayout), {
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
