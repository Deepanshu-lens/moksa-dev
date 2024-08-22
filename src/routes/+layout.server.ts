import { redirect } from "@sveltejs/kit";
import type { LayoutServerLoad } from "./$types";
import type { User } from "@/types";
import { decodeJwt } from "@/lib/jwt";
import os from "os";

export const load: LayoutServerLoad = async ({ locals, url, cookies }) => {
  const protectedRoutes = [
    "session",
    "playback",
    "analytics",
    "users",
    "settings",
  ];

  if (
    !locals.pb?.authStore.isValid &&
    protectedRoutes.includes(url.pathname.split("/").filter(Boolean)[0])
  ) {
    console.log("REDIRECTED FROM PROTECTED ROUTE");
    throw redirect(302, "/login");
  }
  const currentUserToken = decodeJwt(locals.pb?.authStore.token || "");
  if (currentUserToken) {
    let currentUser = await locals.pb
      ?.collection("users")
      .getOne(currentUserToken.id);
    if (currentUser) {
      if (currentUser.nonce) {
        const nonce = url.searchParams.get("nonce");
        const userToken = decodeJwt(currentUser.nonce);
        if (userToken.nonce === nonce) {
          await locals.pb?.collection("users").update(currentUserToken.id, {
            nonce: "",
            credits: currentUser.credits + userToken.credits,
          });
          currentUser = await locals.pb
            ?.collection("users")
            .getOne(currentUserToken.id);
        }
      }

      if (locals.user.record.session?.length > 0) {
        const session = await locals.pb
          ?.collection("session")
          .getOne(locals.user.record.session[0]);
        // console.log(locals.user.record.session[0])
        const nodes = await locals.pb?.collection("node").getFullList<Node[]>({
          filter: `session~"${locals.user.record.session[0]}"`,
        });

        const role = await locals.pb?.collection("roles").getFullList({
          filter: `id~"${currentUser.role}"`,
        });

        // console.log(role);

        const featureList = await locals.pb
          ?.collection("feature")
          .getFullList();

        // console.log(featureList);

        // const matchedFeatures = featureList
        //   ?.filter((feature) => role?.[0]?.features?.includes(feature.id))
        //   ?.map((feature) => feature.feature);
        const matchedFeatures = featureList
        ?.filter((feature) => currentUser?.features?.includes(feature.id))
        ?.map((feature) => feature.feature);

        // console.log(matchedFeatures);
        // console.log(session)

        return {
          loggedIn: locals.pb?.authStore.isValid,
          user: {
            id: locals.user.record.id,
            name: locals.user.record.name,
            firstName: locals.user.record.firstName,
            lastName:locals.user.record.lastName,
            email: locals.user.record.email,
            session: locals.user.record.session[0],
            role: role?.[0]?.roleName,
            features: matchedFeatures,
          } as User,
          session: { ...session },
          nodes: structuredClone(nodes),
          url: url.pathname,
        };
      } else {
        return {
          loggedIn: locals.pb?.authStore.isValid,
          user: {
            name: locals.user.record.name,
            email: locals.user.record.email,
          } as User,
          session: { node: [] },
          nodes: [],
          url: url.pathname,
        };
      }
    }
  }
  return {
    loggedIn: false,
    nodes: [],
    session: {},
  };
};
