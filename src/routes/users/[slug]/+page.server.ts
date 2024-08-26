import { fail } from '@sveltejs/kit';
import PocketBase from 'pocketbase';

export const load: PageServerLoad = async ({ fetch, cookies }) => {
    if (!cookies.get('moksa-token')) {
        await fetch(`https://dev.api.moksa.ai/auth/login`, {
            method: "POST", headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email: 'anushiya@gmail.com', password: 'anushiya' }),
        }).then(async (res) => {
            const data = await res.json();
            // console.log(data);
            if (data.data && data.data.token) {
                const token = data.data.token;
                // Set the token in a cookie
                const cookieOptions = {
                    httpOnly: true,
                    secure: false,
                    sameSite: "lax",
                    domain: undefined,
                    maxAge: 60 * 60 * 23
                };
                // console.log("TOKEN!!!!!!!!!!")
                cookies.set('moksa-token', token, cookieOptions);
                // console.log('Token saved in cookie');
            } else {
                console.log('Token not found in response');
            }
        }).catch((err) => {
            console.log(err);
        });
    }
    const today = new Date();
    const oneYearAgo = new Date(today);
    const oneWeekAgo = new Date(today);
    oneYearAgo.setFullYear(today.getFullYear() - 1);
    oneWeekAgo.setDate(today.getDate() - 7);

    const allUsers = async () => {
        const allUsers = await fetch(`https://dev.api.moksa.ai/auth/getAllUsers/1/100`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${cookies.get('moksa-token')}`
            }
        });
        return allUsers.json();
    }

    const safeExecute = async (fn: () => Promise<any>) => {
        try {
            return await fn() || [];
        } catch (error) {
            console.error(`Error executing function: ${error}`);
            return [];
        }
    };
    return {
        moksaToken: cookies.get('moksa-token'),
        usersData: await safeExecute(allUsers)
    };
};

export const ssr = false;