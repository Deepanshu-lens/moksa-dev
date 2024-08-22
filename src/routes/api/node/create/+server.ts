import type { RequestEvent, RequestHandler } from "./$types";

export const POST: RequestHandler = async ({
  locals,
  request,
  cookies
}: RequestEvent) => {
  console.log("Creating new node");
  console.log(locals.user.record.session)
  try {
    const data = await request.json();
    const token = cookies.get('moksa-token');
    const mobileLay = 1
    console.log(data);

    const result = await locals.pb?.collection("node").create({
      name: data.name,
      session: data.sessionId,
      mobileLayout: mobileLay
    });

    // console.log(result.id)
    await locals.pb
      ?.collection("session")
      .update(locals.user.record.session[0], {
        "node+": [result?.id],
      });

     await fetch(`https://dev.api.moksa.ai/store/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ name: data.name, address: data.address, pincode: data.pin, country: data.country, manager: data.manager }),
    }).then(async (res) => {
      console.log(res);
      const newS = await res.json();
      console.log(newS);
      await locals.pb?.collection("node").update(result?.id, {
        moksaId: newS?.data.id
      })
    }).catch((err) => {
      console.log(err);
    })

    return new Response(JSON.stringify({ node: result }), { status: 200 });
  } catch (err) {
    console.log(err);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
    });
  }
};
