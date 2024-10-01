export const ssr = false

import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, fetch, locals }) => {
    console.log(locals.user)
    const { slug } = params;
    console.log(slug)
    try {
        const response = await locals.pb?.collection('users').getFullList({
            filter: `session ~ "${slug}"`
        })

        console.log(response)
        const serializableAccount = response ? JSON.parse(JSON.stringify(response)) : null;

        return {
            account: serializableAccount
        };
    } catch (error) {
        console.error('Error loading account data:', error);
        return {
            account: null,
            error: 'Failed to load account data'
        };
    }
};
