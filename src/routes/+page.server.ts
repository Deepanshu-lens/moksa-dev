import { redirect } from "@sveltejs/kit";

export const load = async ({ locals, url, cookies }) => {
  // console.log("pb", locals.pb?.authStore.baseToken);
  // const authToken = locals.pb?.authStore.basetoken
  const authToken = cookies.get("pb_auth");
  // console.log('auth',JSON.parse(authToken))
  if (authToken) {
    throw redirect(302, "/session/" + JSON.parse(authToken).model.session[0]);
  }
  console.log("REDIRECTED FROM PAGE.SERVER");
  throw redirect(302, "/login");
};
