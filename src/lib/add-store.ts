import { toast } from "svelte-sonner";
import pb from "./pb";

export const addStore = async (token:string, data:any, user:any) => {
  try {
    const mobileLay = 1;

    const result = await pb?.collection("node").create({
      name: data.name,
      session: data.sessionId,
      mobileLayout: mobileLay,
      timezone: data.timezone,
      storeOpenTime: data.storeOpenTime,
      storeCloseTime: data.storeCloseTime,
      isStore24hr: data.isStore24hr,
    });

    await pb?.collection("session").update(user?.session, {
      "node+": [result?.id],
    });

    await fetch(`${import.meta.env.PUBLIC_MOKSA_BASE_URL}/store/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        name: data.name,
        address: data.address,
        pincode: data.pin,
        country: data.country,
        manager: data.manager,
        timezone: data.timezone,
        openingTime: data.storeOpenTime,
        closingTime: data.storeCloseTime,
        is24HrStore: data.isStore24hr,
        hasKitchen: data.hasKitchen,
      }),
    })
      .then(async (res) => {
        const newS = await res.json();
        const userStoresResponse = await fetch(
          `${
            import.meta.env.PUBLIC_MOKSA_BASE_URL
          }/store/getUserStoreDetailsByUserId/${user?.moksaId}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const userStoresData = await userStoresResponse.json();
        let storeIds =
          userStoresData.data.length === 0
            ? []
            : userStoresData.data[0].stores.map((store: any) => store.storeId);
        if (storeIds.length === 0 || storeIds[0] === null) {
          storeIds = [newS.data.id];
        } else {
          storeIds.push(newS.data.id);
        }

        
        await fetch(
          `${
            import.meta.env.PUBLIC_MOKSA_BASE_URL
          }/store/userStore/updateUserByUserId`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              userId: user?.moksaId,
              storeIds: storeIds,
            }),
          }
        ).then(async () => {
          toast.success("Store created successfully");
        });
        await pb?.collection("node").update(result?.id, {
          moksaId: newS?.data.id,
        });
      })
      .catch((err) => {
        console.log(err);
      });

    return { success:true };
  } catch (err) {
    console.log(err);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
    });
  }
};
