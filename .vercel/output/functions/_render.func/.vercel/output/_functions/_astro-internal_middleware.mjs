import { d as defineMiddleware, s as sequence } from './chunks/index_CCr39lXu.mjs';
import 'es-module-lexer';
import './chunks/astro-designed-error-pages_CnwVU_1O.mjs';
import 'cookie';

let mToken = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOjI0LCJmaXJzdF9uYW1lIjoibWFpbiIsImxhc3RfbmFtZSI6InVzZXIiLCJlbWFpbCI6Im1haW4udXNlckBtb2tzYS5haSIsImlhdCI6MTczNTgyMDk5MiwiZXhwIjoxNzM1OTA3MzkyfQ.AjmlXHRYv-yLf9udUDKA3mOvlHKX02FJuWz9ycQZvTI`;
const onRequest$1 = defineMiddleware(async (context, next) => {
  context.locals.moksa = {
    token: mToken,
    user: {
      avatar: "download_9N9VYdIRK0.png",
      collectionId: "_pb_users_auth_",
      email: "main.user@moksa.ai",
      features: [],
      firstName: "main",
      id: "vtlzgvuiepk1mul",
      lastName: "user",
      moksaId: 68,
      name: "",
      role: "superAdmin",
      session: "85et6t89vibycns"
    }
  };
  return await next();
});

const onRequest = sequence(
	
	onRequest$1
	
);

export { onRequest };
