import { redirect } from "@sveltejs/kit";
import { toast } from "svelte-sonner";
export const actions = {
  forgotpassword: async ({ locals, request, cookies }) => {
    console.log("LOGING ATTEMPT");
    const data = await request.formData();
    const email = data.get("email")?.toString() || "";

    try {
      await fetch(`https://dev.api.moksa.ai/auth/sendOtp`, {
        method: "POST", headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email: email }),
      }).then(async (res) => {
        const data = await res.json();
        if (data?.status === 200) {
          toast.success(data?.message);
        } else {
          console.log('Token not found in response');
          throw redirect(303, `/forgot-password?message=send link failed,`);
        }
      }).catch((err) => {
        console.log(err, 'error in forgot password');
        throw redirect(303, `/forgot-password?message=send link failed,`);
      });

    } catch (err: any) {
      console.log(err, 'error here')
      console.log("forgot password error", err.message === undefined ? "User not found" : err.message);
      // throw error(err.status || 500, err.message || "An error occurred");
      throw redirect(303, `/forgot-password?message=${err.message === undefined ? "User not found," : err.message}`);
    }

    throw redirect(301, "/login?success=Reset link sent successfully");
  },
};
