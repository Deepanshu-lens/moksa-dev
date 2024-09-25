import { fail, redirect, type Cookies } from "@sveltejs/kit";

const loginWithEmailPassword = async (
  locals: App.Locals,
  cookies: Cookies,
  email: string,
  password: string,
) => {
  try {
  
    await locals.pb?.collection("users").authWithPassword(email, password);
    const isProd = process.env.NODE_ENV === "production" ? true : false;
    if (locals.pb?.authStore.isValid) {
      cookies.set(
        "pb_auth",
        locals.pb?.authStore.exportToCookie({
          secure: isProd,
          sameSite: "lax",
          httpOnly: true,
        }),
      );
      return { success: true };
    }
  } catch (e: any) {
    if (e.status >= 400 && e.status <= 500) {
      const message = "Failed to Authenticate.";
      // return fail(e.status, {
      //   email,
      //   error: true,
      //   message: "failed to authenticate",
      // });
      throw redirect(303, `/register?message=${message}`);
    }
    if (e.status >= 500) {
      const message = "Auth Server not Reachable.";

      // return fail(e.status, {
      //   email,
      //   error: true,
      //   message: "authentication server could not be reached",
      // });
      throw redirect(303, `/register?message=${message}`);
    }
  }
};

export const actions = {
  signup: async ({ locals, request, cookies }) => {
    const data = await request.formData();
    const firstName = data.get("firstName")?.toString() || "";
    const lastName = data.get("lastName")?.toString() || "";
    const email = data.get("email")?.toString() || "";
    const password = data.get("password")?.toString() || "";
    const passwordConfirm = data.get("confirm-password")?.toString() || "";

    if (password !== passwordConfirm) {
      // return fail(422, {
      //   email,
      //   error: true,
      //   message: "password and password confirm must match",
      // });
      const message = "Passwords dont Match.";

      throw redirect(303, `/register?message=${message}`);
    }
    try {
      // Create a session
      const session = await locals.pb
        ?.collection("session")
        .create({
          owned: true,
        })
        .catch((e) => {
          console.error("[Session Create Error]: ", e);
        });
 const create = await locals.pb?.collection("users").create({
        firstName,
        lastName,
        email,
        password,
        passwordConfirm,
        session: session?.id,
      });

      console.log(create)

      await fetch(`https:api.moksa.ai/auth/register`, {
        method: "POST", headers: {
          'Content-Type': 'application/json'
        }, body: JSON.stringify({
          first_name: firstName,
          lastName: lastName,
          role: 'adminNonPaid',
          email:email ,
          password:passwordConfirm,
          lensId: create.id,
        })
      })

    } catch (e: any) {
      const message = e.message;
      console.log(message);
      // return fail(422, { error: true, message: e.response.data });
      // const message = "Passwords dont Match";

      throw redirect(303, `/register?message=${message}`);
    }
    await loginWithEmailPassword(locals, cookies, email, password);
    throw redirect(303, "/login");
  },
};
