import type { RequestEvent, RequestHandler } from "./$types";

export const POST: RequestHandler = async ({
  locals,
  request,
  cookies
}: RequestEvent) => {
  console.log("Creating new node");
  console.log(locals.user.record.session)
  try {
    const data = await request.json();
    const token = cookies.get('moksa-token');
    const mobileLay = 1
    console.log(data);

    const result = await locals.pb?.collection("node").create({
      name: data.name,
      session: data.sessionId,
      mobileLayout: mobileLay,
      timezone: data.timezone,
      storeOpenTime: data.storeOpenTime,
      storeCloseTime: data.storeCloseTime,
      isStore24hr: data.isStore24hr,
    });

    // console.log(result)
    await locals.pb
      ?.collection("session")
      .update(locals.user.record.session[0], {
        "node+": [result?.id],
      });

    const ot = data.is24HrStore === false ? `${data.storeOpenTime}:00` : null
    const ct = data.is24HrStore === false ? `${data.storeCloseTime}:00` : null
    await fetch(`https://api.moksa.ai/store/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ name: data.name, address: data.address, pincode: data.pin, country: data.country, manager: data.manager, timezone: data.timezone, openingTime: ot, closingTime: ct, is24HrStore: data.isStore24hr, hasKitchen: data.hasKitchen }),
    }).then(async (res) => {
      // console.log(res);
      const newS = await res.json();
      // console.log(newS);
      const userStoresResponse = await fetch(`https://api.moksa.ai/store/getUserStoreDetailsByUserId/${locals.user.record.moksaId}`, {
        headers: {
          "Content-Type": "application/json",
          'Authorization': `Bearer ${token}`
        },
      });

      const userStoresData = await userStoresResponse.json();
      // console.log(userStoresData)
      let storeIds = userStoresData.data.length === 0 ? [] : userStoresData.data[0].stores.map((store: any) => store.storeId);
      if (storeIds.length === 0 || storeIds[0] === null) {
        storeIds = [newS.data.id];
      } else {
        storeIds.push(newS.data.id);
      }
      // console.log(storeIds)
      // console.log(locals.user.record.moksaId)
      await fetch(`https://api.moksa.ai/store/userStore/updateUserByUserId`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ userId: locals.user.record.moksaId, storeIds: storeIds }),
      }).then(async (res) => {
        const data = await res.json()
        // console.log(data)
      })
      await locals.pb?.collection("node").update(result?.id, {
        moksaId: newS?.data.id
      })

    }).catch((err) => {
      console.log(err);
    })

    return new Response(JSON.stringify({ node: result }), { status: 200 });
  } catch (err) {
    console.log(err);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
    });
  }
};
