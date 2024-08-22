import type { RequestEvent, RequestHandler } from "./$types";

export const PATCH: RequestHandler = async ({
  locals,
  request,
}: RequestEvent) => {
  console.log("Updating Username");
  const { sessionId, newName } = await request.json();

  const userRecord = await locals.pb
    ?.collection("users")
    .getFullList({ filter: `session.id="${sessionId}"` });

  const updatedUser = await locals.pb
    ?.collection("users")
    .update(userRecord[0]?.id, {
      name: newName,
    });

  return new Response(JSON.stringify({ updatedUser }), { status: 200 });
};
