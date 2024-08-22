import type { RequestEvent, RequestHandler } from "./$types";

export const POST: RequestHandler = async ({
  locals,
  request,
}: RequestEvent) => {
  console.log("NEW USERLOG ADDED!");
  try {
    // console.log(locals.user);
    const data = await request.json();
    // console.log(data);

    const res = await locals.pb?.collection("userlogs").create({
      email: locals?.user?.record?.email,
      event: data.event,
    });

    // console.log(res.id);

    const update = await locals.pb
      ?.collection("users")
      .update(locals?.user?.record?.id, {
        "logs+": [res?.id],
      });
    // console.log(update);

    return new Response(null, { status: 200 });
  } catch (err) {
    console.log(err);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
    });
  }
};
