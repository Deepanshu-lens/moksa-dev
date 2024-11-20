import type { RequestEvent, RequestHandler } from "./$types";

export const DELETE: RequestHandler = async ({
    locals,
    request,
    cookies
}: RequestEvent) => {
    const data = await request.json();
    if (data.id !== undefined) {
        await locals.pb?.collection("node").delete(data.id);
    }

    await fetch(`https://dev.api.moksa.ai/store/delete/${data.moksaId}`, {
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${cookies.get("moksa-token")}`,
        },
        method: "POST",
        body: JSON.stringify({
            id: data.moksaId,
        })
    })

    return new Response(null, { status: 200 });
};
