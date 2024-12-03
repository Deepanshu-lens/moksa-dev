import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, locals }) => {
    try {
        const { firstName, lastName, mailId, password, userType, phoneNumber, token } = await request.json();
        // const token = cookies.get('moksa-token');


        const session = await locals.pb?.collection("session").create({
            owned: true,
        });

        const roleDetails = await locals.pb?.collection("roles").getFullList({
            filter: `roleName = "admin"`,
        });

        console.log(roleDetails);

        const createuser = await locals.pb?.collection("users").create({
            firstName,
            lastName,
            email: mailId,
            role: roleDetails[0].id,
            session: session.id,
            password,
            passwordConfirm: password
        });

        const lensId = createuser.id;
        console.log('lensId', lensId);

        const moksa = await fetch(
            `https://dev.api.moksa.ai/auth/createUserWithPocketbase`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    first_name: firstName,
                    last_name: lastName,
                    email: mailId,
                    password,
                    lensId,
                    role: 'admin',
                    mobile_number: phoneNumber

                }),
            },
        );
        if (!moksa.ok) {
            return json({ error: 'moksa_failed' }, { status: 500 });
        }
        const d = await moksa?.json();

        const update = await locals.pb?.collection("users").update(lensId, {
            moksaId: d.data.id,
        });

        console.log(update);



        return json(d);
    } catch (error) {
        console.error('Error creating user:', error);
        return json({ error: 'Failed to create user' }, { status: 500 });
    }
};