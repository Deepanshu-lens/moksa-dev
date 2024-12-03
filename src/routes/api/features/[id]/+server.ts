import type { RequestEvent, RequestHandler } from "@sveltejs/kit";

export const GET: RequestHandler = async ({
    locals,
    request,
    params
  }: RequestEvent) => {

    const { id } = params;
   
    const featureList = await locals.pb?.collection("feature").getList(1,50,{
        filter: `page~"${id}"`
    });
    // console.log(featureList);  
    return new Response(JSON.stringify({ features: featureList }), { status: 200 });
  };