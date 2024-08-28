import type { RequestEvent, RequestHandler } from "./$types";

export const PATCH: RequestHandler = async ({
  locals,
  request,
  cookies
}: RequestEvent) => {
  console.log("Editing Node");
  const data = await request.json();

  await locals.pb?.collection("node").update(data.id, {
    name: data.name,
  });

  await fetch(`https://api.moksa.ai/store/update`, {
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${cookies.get("moksa-token")}`,
    },
    method: "POST",
    body: JSON.stringify({
      id: data.moksaId,
      name: data.name,
      address: data.address,
      pincode: data.pincode,
      country: data.country,
      manager: data.manager
    })
  })

  return new Response(null, { status: 200 });
};
