import type { RequestHandler, RequestEvent } from "@sveltejs/kit";

export const POST: RequestHandler = async ({ request, locals, cookies }: RequestEvent) => {
    try {
        const { serverIP, serverPort } = await request.json();
        const authCookie = cookies.get('pb_auth');
        
        // Example: Use serverIP and serverPort to make a network request or similar
        // You might need to import a library or write a function to handle this.

        // Assuming authCookie is used for some authentication purpose
        if (!authCookie) {
            return new Response(JSON.stringify({ error: 'Authentication required' }), {
                status: 401,
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        }

        console.log(authCookie)

        return new Response(JSON.stringify({ message: 'wowow' }), {
            status: 200,
            headers: {
                'Content-Type': 'application/json'
            }
        });
    } catch (error: any) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json'
            }
        });
    }
}