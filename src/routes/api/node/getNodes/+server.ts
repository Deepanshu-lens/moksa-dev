import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import PocketBase from 'pocketbase';
import type { Node, Camera } from '@/types.d.ts';

export const GET: RequestHandler = async ({ url,locals }) => {
    const sessionId = url.searchParams.get('sessionId');
    if (!sessionId) {
        return json({ error: 'Session ID is required' }, { status: 400 });
    }

    try {
        const nodes = await locals.pb?.collection("node").getFullList(200, {
            sort: "-created",
            filter: `session~"${sessionId}"`,
        });

        const allCameraNumbers: { [nodeId: string]: number[] } = {};

        for (const node of nodes) {
            const cameras = await locals.pb?.collection("camera").getFullList({
                filter: `node~"${node.id}"`,
                sort: "-created",
                expand: 'personCounter,inference'
            });

            node.camera = cameras.map((cam: Camera) => ({
                ...cam,
                personCounter: cam?.expand?.personCounter?.count,
            }));
            allCameraNumbers[node.id] = cameras.map(cam => cam.cameraNo);
        }

        const processedNodes = nodes.map((node) => ({
            ...node,
            session: sessionId,
            allCameraNumbers: allCameraNumbers[node.id],
        }) as Node);

        return json(processedNodes);
    } catch (error) {
        console.error('Error fetching nodes:', error);
        return json({ error: 'Failed to fetch nodes' }, { status: 500 });
    }
};