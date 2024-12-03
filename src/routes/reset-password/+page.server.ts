import { redirect, error } from "@sveltejs/kit";

let token: string;

// // Add this load function to get query parameters
export const load = ({ url }) => {
    token = url.searchParams.get('token');

    if (!token) {
        throw redirect(303, '/login?message=Invalid reset password link');
    }
};
// reset1
export const actions = {
    resetPassword: async ({ locals, request, cookies, url }) => {
        console.log("LOGING ATTEMPT");
        const data = await request.formData();
        const password = data.get("password")?.toString() || "";
        const confirmPassword = data.get("confirmPassword")?.toString() || "";

        if (!token) {
            throw redirect(303, `/login?message=invalid reset password link`);
        }

        if (password !== confirmPassword) {
            throw redirect(303, `/reset-password?message=passwords doesn't match`);
        }

        try {
            await fetch(`https://dev.api.moksa.ai/auth/resetPassword`, {
                method: "POST", headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ newPassword: password, resetToken: token }),
            }).then(async (res) => {
                const data = await res?.json();
            }).catch((err) => {
                console.log(err);
                throw redirect(303, `/reset-password?message=send link failed,`);
            });

        } catch (err: any) {
            console.log(err, 'error here')
            console.log("forgot password error", err.message === undefined ? "User not found" : err.message);
            // throw error(err.status || 500, err.message || "An error occurred");
            throw redirect(303, `/forgot-password?message=${err.message === undefined ? "User not found," : err.message}`);
        }
        throw redirect(303, "/login?success=Password Reset successfully");
    },
};
