import { redirect, error } from "@sveltejs/kit";
import os from "os";
export const actions = {
  login: async ({ locals, request, cookies }) => {
    console.log("LOGING ATTEMPT");
    const data = await request.formData();
    const email = data.get("email")?.toString() || "";
    const password = data.get("password")?.toString() || "";
    // const operatingSystem = os.platform;
    // console.log(operatingSystem);
    try {
      await fetch(`https://api.moksa.ai/auth/login`, {
        method: "POST", headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email: email, password: password }),
      }).then(async (res) => {
        const data = await res.json();
        console.log(data);
        if (data.data && data.data.token) {
          const token = data.data.token;
          const cookieOptions = {
            httpOnly: true,
            secure: false,
            sameSite: "lax",
            domain: undefined,
            maxAge: 60 * 60 * 23
          };
          cookies.set('moksa-token', token, cookieOptions);

          console.log('Token saved in cookie');
        } else {
          console.log('Token not found in response');
          throw redirect(303, `/login?message=User not found,`);
        }
      }).catch((err) => {
        console.log(err);
        throw redirect(303, `/login?message=User not found,`);
      });
      
      const user = await locals.pb
        ?.collection("users")
        .authWithPassword(email, password);

      const eventData = { email: email };

      const event = await locals.pb
        ?.collection("loginEvents")
        .create(eventData);

      await locals.pb?.collection("users").update(user?.record?.id, {
        "loginEvents+": [event?.id],
      });
    } catch (err: any) {
      console.log("login error", err.message === undefined ? "User not found" : err.message);
      // throw error(err.status || 500, err.message || "An error occurred");
      throw redirect(303, `/login?message=${err.message === undefined ? "User not found," : err.message}`);
    }
    throw redirect(303, "/");
  },
};
