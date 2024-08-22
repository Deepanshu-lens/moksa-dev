import type { RequestEvent, RequestHandler } from "./$types";

export const POST: RequestHandler = async ({
  locals,
  request,
}: RequestEvent) => {
  console.log("Creating new nodes");

  try {
    const updates = await request.json();

    for (const update of updates) {
      const { id, features } = update;

      if (features.length === 0) {
        console.log(`Skipping update for id ${id} as features array is empty`);
        continue;
      }

    //   console.log(id);
    //   console.log(features);

      const data = {
        features: features,
      };

    //   console.log(data);

      const record = await locals.pb?.collection('users').update(`${id}`, data);
    //   console.log(record);
    }

    return new Response(JSON.stringify({ message: "All records updated successfully" }), { status: 200 });
  } catch (err) {
    console.log(err);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
    });
  }
};