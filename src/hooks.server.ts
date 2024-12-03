import PocketBase from "pocketbase";
import { VITE_POCKETBASE_URL, VITE_BASE_URL } from "$env/static/private";
import { dev } from "$app/environment";


export const handle = async ({ event, resolve }) => {
  event.locals.pb = new PocketBase(`https://server.moksa.ai`);
  event.locals.pb.autoCancellation(false)
  event.locals.pb.authStore.loadFromCookie(
    event.request.headers.get("cookie") || ''
  );
  try {
    if (event.locals.pb.authStore.isValid) {
      event.locals.user = await event.locals.pb
        .collection("users")
        .authRefresh();
    } else {
      event.locals.pb.authStore.clear();
      event.locals.user = undefined;
    }
  } catch (_) {
    event.locals.pb.authStore.clear();
    event.locals.user = undefined;
  }

  const response = await resolve(event);

  const pbAuthCookie = event.locals.pb.authStore.exportToCookie({
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    domain: undefined, 
  });


  const existingCookies = response.headers.get("set-cookie") || "";
  const newCookies = existingCookies ? `${existingCookies}, ${pbAuthCookie}` : pbAuthCookie;

  response.headers.set("set-cookie", newCookies);

  return response;
};