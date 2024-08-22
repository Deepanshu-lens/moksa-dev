export const ssr = false;

export async function load({ locals }) {

  // console.log(locals.user.record.session)
  const events = async () => {
    const e = await locals.pb?.collection("events").getList(1, 200, {
      sort: "-created",
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

  return {
    events: events()
  };
}
