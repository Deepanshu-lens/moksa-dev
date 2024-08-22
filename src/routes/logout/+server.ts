import { redirect } from "@sveltejs/kit";
import type { RequestEvent, RequestHandler } from "./$types";

export const GET: RequestHandler = async ({ locals }: RequestEvent) => {
  // console.log("Logging out");
  console.log("REDIRECTED FROM LOG OUT");
  const res = await locals.pb?.collection("userlogs").create({
    email: locals?.user?.record?.email,
    event: "logout",
  });

  await locals.pb?.collection("users").update(locals?.user?.record?.id, {
    "logs+": [res?.id],
  });
  locals.pb?.authStore.clear();
  // return new Response(null, { status: 303 });
  throw redirect(302, "/login");
};
