import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, cookies, locals }) => {
    try {
        const { oldPassword, password, passwordConfirm } = await request.json();

        // Ensure all required fields are present
        if (!oldPassword || !password || !passwordConfirm) {
            return json({ success: false, message: 'All fields are required' }, { status: 400 });
        }

        // Get the current user
        const user = locals.user.record;
        console.log(user)

        if (!user) {
            return json({ success: false, message: 'User not authenticated' }, { status: 401 });
        }

        // Update the user's password

        const token = cookies.get('moksa-token')
        const moksaUPdate = await fetch('https://dev.api.moksa.ai/auth/changePassword', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                password: password,
            }),
        });

        await locals.pb?.collection('users').update(user.id, {
            oldPassword,
            password,
            passwordConfirm: passwordConfirm,
        });

        cookies.delete('moksa-token')

        console.log(moksaUPdate)


        return json({ success: true, message: 'Password updated successfully' });
    } catch (error) {
        console.error('Password reset error:', error);
        return json({ success: false, message: 'Failed to update password' }, { status: 500 });
    }
};