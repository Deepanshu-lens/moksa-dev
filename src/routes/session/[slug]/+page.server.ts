import type { PageServerLoad } from './$types.js';

export const ssr = false;

export type OutputType = {
  [key: string]: {
    authProviderRedirect: string;
    authProviderState: string;
    authCodeVerifier: string;
  };
};

export const actions = {
  addNode: async ({ locals, request, cookies }) => {
    const token = cookies.get('moksa-token');
    const data = await request.formData();
    const name = data.get("name")?.toString() || "";
    const address = data.get("address")?.toString() || "";
    const pincode = data.get("pincode")?.toString() || "";
    const country = data.get("country")?.toString() || "";
    const manager = data.get("manager")?.toString() || "";
    console.log(data)
    const node = await locals.pb
      ?.collection("node")
      .create({ name, session: locals.user.record.session[0], mobileLayout: 1 });

    const moksaStore = await fetch(`https://api.moksa.ai/store/create`, {
      method: 'POST',
      headers: {
        "Content-Type": "application/json",
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ name: name, address: address, pincode: pincode, country: country, manager: manager }),
    });
    console.log(moksaStore)
    const store = await moksaStore.json();
    console.log('store',store)

    if (store.status === 201) {
      console.log("Store created successfully")
      await locals.pb
        ?.collection("node")
        .update(node?.id, {
          "moksaId": store.data.id
        });
        await locals.pb
        ?.collection("session")
        .update(locals.user.record.session[0], {
          "node+": [node?.id],
        });
    }

  
  },
};

export const load: PageServerLoad = async ({ locals, cookies }) => {

  locals.pb?.autoCancellation(false)
  const events = async () => {
    const e = await locals.pb?.collection("events").getList(1, 100, {
      sort: "created",
      fields:
        "title,description,created,updated,frameImage,score,matchScore,session,node,camera",
    });
    return e?.items.map(
      (ee) =>
        ({
          ...ee,
          created: new Date(ee.created),
        }) as unknown as Event,
    );
  }

  const gelleryItems = async () => {
    const g = await locals.pb?.collection("faceGallery").getFullList({
      sort: "-lastSeen",
      expand: "events",
      fields: "name,lastSeen,images,expand.events.frameImage",
    });
    return g?.map((e) => ({
      name: e.name,
      lastSeen: e.lastSeen,
      savedData: e.images,
      images: e.expand.events
        ? e.expand.events
          .map((f) => f.frameImage)
          .slice(-8)
          .reverse()
        : [],
      created: new Date(),
      updated: new Date(),
    }));

  }

  const dropdown = async () => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch('https://api.moksa.ai/store/getAllStoresForDropdown', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${cookies.get('moksa-token')}`
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      return response.json();
    } catch (error) {
      if (error.name === 'AbortError') {
        console.log('Request timed out');
        return [];
      }
      return [];
    }
  };

  const imposterItems = async () => {
    const i = await locals.pb
      ?.collection("impostors")
      .getList(1, 10, {
        sort: "-lastSeen",
        expand: "events",
        fields: "name,lastSeen,expand.events.frameImage",
      });

    return i?.items.map((e) => ({
      name: "Unknown",
      lastSeen: e.lastSeen,
      images: e.expand.events
        .map((f) => f.frameImage)
        .slice(-8)
        .reverse(),
      created: new Date(),
      updated: new Date(),
    }));

  }

  const moksaEvents = async () => {
    const e = await locals.pb?.collection("moksa_Events").getList(1, 100, {
      sort: "-created",
    });
    return e?.items.map(
      (ee) =>
        ({
          ...ee,
          created: new Date(ee.created),
        }) as unknown as Event,
    );
  }
  
  return {
    events: await events(),
    galleryItems: await gelleryItems(),
    imposterItems: await imposterItems(),
    stores: await dropdown(),
    token: cookies.get('moksa-token'),
    moksaEvents: await moksaEvents(),
  };
}
