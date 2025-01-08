import { parse } from "cookie";

export async function onRequest(context, next) {
  const { request } = context;

  // Parse cookies from the request header
  const cookieHeader = request.headers.get("cookie") || "";
  const cookies = parse(cookieHeader)["moksa-token"];

  context.locals.moksa = {
    token: cookies,
  };

  // return a Response directly, or the result of calling `next()`
  return next();
}
