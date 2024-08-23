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
      const user = await locals.pb
        ?.collection("users")
        .authWithPassword(email, password);

      // console.log(user);
      await fetch(`https://dev.api.moksa.ai/auth/login`, {
        method: "POST", headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email: 'anushiya@gmail.com', password: 'anushiya' }),
      }).then(async (res) => {
        const data = await res.json();
        console.log(data);
        if (data.data && data.data.token) {
          const token = data.data.token;
          // Set the token in a cookie
          // const cookieOptions = {
          //   path: '/',
          //   httpOnly: true,
          //   secure: process.env.NODE_ENV === 'production',
          //   sameSite: 'strict',
          //   maxAge: 60 * 60 * 23
          // };
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
        }
      }).catch((err) => {
        console.log(err);
      });

      const eventData = { email: email };

      const event = await locals.pb
        ?.collection("loginEvents")
        .create(eventData);

      await locals.pb?.collection("users").update(user?.record?.id, {
        "loginEvents+": [event?.id],
      });
    } catch (err: any) {
      console.log("login error", err.message);
      // throw error(err.status || 500, err.message || "An error occurred");
      throw redirect(303, `/login?message=${err.message}`);
    }
    throw redirect(303, "/");
  },
};
