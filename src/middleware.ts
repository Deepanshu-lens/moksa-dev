import { defineMiddleware } from "astro:middleware";

let mToken = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOjI0LCJmaXJzdF9uYW1lIjoibWFpbiIsImxhc3RfbmFtZSI6InVzZXIiLCJlbWFpbCI6Im1haW4udXNlckBtb2tzYS5haSIsImlhdCI6MTczNTg5MDUwMywiZXhwIjoxNzM1OTc2OTAzfQ.PGVP5HZgCq7jhgBFODwqmDpkgPQo0dnSrMTyBaOoiSg`;

export const onRequest = defineMiddleware(async (context, next) => {
  
  context.locals.moksa = {
    token: mToken,
    user : {
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
      session: "85et6t89vibycns",
    },
    
  };
  return await next();
});
