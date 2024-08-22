import { fail } from '@sveltejs/kit';
import PocketBase from 'pocketbase';

export const actions = {
    createUser: async ({ request, url,cookies }) => {
        const formData = await request.formData();
        const firstName = formData.get('firstName');
        const lastName = formData.get('lastName');
        const email = formData.get('mailId');
        const role = formData.get('userType');
        const password = formData.get('password');
        const passwordConfirm = formData.get('cPassword'); 

        if (password !== passwordConfirm) {
            return fail(400, { error: "Passwords don't match" });
        }

        const PB = new PocketBase(`http://${url.hostname}:5555`);

        try {
            const session = await PB.collection("session").create({ owned: true });
            console.log(session)
            const user = await PB.collection("users").create({
                firstName,
                lastName,
                email,
                role,
                session: session.id,
                password,
                passwordConfirm,
            });
            
            console.log(user)
         const moksa=   await fetch(`https://dev.api.moksa.ai/auth/createUserWithPocketbase`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${cookies.get('moksa-token')}` },
                body: JSON.stringify({
                    first_name: firstName,
                    last_name: lastName,
                    email,
                    password,
                    lensId: user.id,
                    role: 'user'
                })
            });
            console.log(moksa)
            return { success: true };
        } catch (error) {
            console.error(error);
            return fail(500, { error: "Failed to create user" });
        }
    }
};

export const ssr = false;