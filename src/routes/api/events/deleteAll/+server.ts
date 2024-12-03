import { redirect } from "@sveltejs/kit";
import { VITE_POCKETBASE_URL } from "$env/static/private";
import type { RequestEvent, RequestHandler } from "./$types";

export const DELETE: RequestHandler = async ({
  locals,
  request,
}: RequestEvent) => {
  // const data = await request.json();
  // console.log(data);
  // await locals.pb?.collection("events").delete();
  // await fetch(VITE_POCKETBASE_URL + "/api/deleteStream", {
  //   method: "POST",
  //   headers: {
  //     "Content-Type": "application/json",
  //   },
  //   body: JSON.stringify(data),
  // });

  //   return new Response(null, { status: 200 });
  // };

  // Retrieve all records from the 'events' collection
  const events = await locals.pb?.collection("events").getFullList();

  // Delete each record individually
  console.log(events);
  if (events?.length > 0) {
    for (const event of events) {
      await locals.pb?.collection("events").delete(event.id);
    }
  }

  return new Response(null, { status: 200 });
};
