export const ssr = false


export const load: PageServerLoad = async ({ cookies, params, fetch, locals }) => {

    const moksaToken = cookies.get("moksa-token")
    const { slug } = params

    // console.log(moksaToken)

    const nodes = async () => {
        const n = await locals.pb.collection('node').getFullList({
            filter: `session ~ "${slug}"`,
            expand: 'camera'
        })
        return n?.map((e) => ({
            ...e,
            created: new Date(e.created).toISOString(),
            expand: {
                camera: e.expand?.camera ? e.expand.camera.map(cam => ({
                    id: cam.id,
                    name: cam.name,
                    moksaId: cam.moksaId,
                    // Add other necessary serializable properties
                })) : []
            }
        }));
    }

    const response = await fetch(`https://api.moksa.ai/customerComplaints/getAllComplaints/1/10`, {
        headers: {
            "Authorization": `Bearer ${moksaToken}`,
            "Content-Type": "application/json"
        }
    })

    // console.log(response)

    const data = await response.json()

    return {
        tickets: data,
        token: moksaToken,
        nodes: await nodes()
    }

}