import type { RequestEvent, RequestHandler } from "./$types";

export const POST: RequestHandler = async ({
  locals,
  request,
}: RequestEvent) => {
  console.log("Getting events");
  const requestData = await request.json();

  const events = await locals.pb?.collection("events").getFullList({
    filter: requestData.ids.map((id) => `id="${id}"`).join("||"),
    expand: "camera",
  });

  //   console.log("Events: " + JSON.stringify(events));

  return new Response(JSON.stringify({ events }), { status: 200 });
};
