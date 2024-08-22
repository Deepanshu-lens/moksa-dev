import type { RequestEvent, RequestHandler } from "./$types";
export const GET: RequestHandler = async ({
  locals,
  request,
}: RequestEvent): Promise<Response> => {
    const records = await locals.pb?.collection('users').getFullList({
      sort: 'created',
      expand: 'session,features',
    });
    // console.log(records)
    return new Response(JSON.stringify({ records }), { status: 200 });
};