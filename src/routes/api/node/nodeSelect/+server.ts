import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, locals }) => {
    try {
        const { nodeId,sessionId } = await request.json();

        const node = await locals.pb?.collection("node").getOne(nodeId);

        const cameras = await locals.pb?.collection("camera").getFullList({
            filter: `node~"${nodeId}"`,
            sort: "-created",
            expand: 'personCounter,inference'
        });

        const formattedNode = {
            ...node,
            camera: cameras.map((cam: any) => ({
                ...cam,
                personCounter: cam?.expand?.personCounter?.count,
            })),
        };

        await locals.pb?.collection("session").update(sessionId, {
            activeNode: formattedNode.id
        });

        return json({ node: formattedNode });
    } catch (error) {
        console.error('Error in node selection:', error);
        return json({ error: 'Failed to fetch node data' }, { status: 500 });
    }
};