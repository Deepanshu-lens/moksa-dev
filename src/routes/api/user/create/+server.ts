import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request,cookies }) => {
    try {
        const { firstName, lastName, mailId, password, userType, lensId } = await request.json();
        const token = cookies.get('moksa-token');

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
                    role: userType.toLowerCase(),
                }),
            },
        );

        const response = await moksa.json();
        return json(response);
    } catch (error) {
        console.error('Error creating user:', error);
        return json({ error: 'Failed to create user' }, { status: 500 });
    }
};