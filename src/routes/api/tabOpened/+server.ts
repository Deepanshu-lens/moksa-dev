import type { RequestEvent, RequestHandler } from "./$types";

export const POST: RequestHandler = async ({ locals, request }: RequestEvent) => {
    const { email } = await request.json();

    const res = await locals.pb?.collection("userlogs").create({
        email: email,
        event: "tab_opened",
    });

    if (locals?.user?.record?.id) {
        await locals.pb?.collection("users").update(locals.user.record.id, {
            "logs+": [res?.id],
        });
    }
    const rec =  await locals.pb?.collection('licenses').getFullList()

    // console.log(rec)

    if(rec) {
        await locals.pb?.collection('licenses').update(rec[0].id, {
            vms: 'true'
        })
    }

    return new Response(JSON.stringify({ success: true }), { status: 200 });
};