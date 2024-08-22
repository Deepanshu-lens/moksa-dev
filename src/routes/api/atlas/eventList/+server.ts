// import type { RequestHandler, RequestEvent } from "@sveltejs/kit";
// import http from 'http';
// import Agent, { HttpsAgent } from 'agentkeepalive';

// export const POST: RequestHandler = async ({ request, locals, cookies }: RequestEvent) => {
//   const {token,serverIP,serverPort} = await request.json()
//   const url = `https://${serverIP}:${serverPort}/evt/list`;

//   const agent = new HttpsAgent({
//     rejectUnauthorized: false // This disables certificate validation
//   });

//   const headers = {
//     'sessionToken': `${token}` // Include the sessionToken in the Authorization header
//   };

//   try {
//     const response = await new Promise((resolve, reject) => {
//       http.get(url, { agent: agent, headers: headers }, (res: any) => { // Pass headers here
//         let data = '';

//         res.on('data', (chunk: any) => {
//           data += chunk;
//         });

//         res.on('end', () => {
//           if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
//             resolve({ status: res.statusCode, data: JSON.parse(data) });
//           } else {
//             reject(new Error('Failed to authenticate'));
//           }
//         });
//       }).on('error', (e: any) => {
//         reject(e);
//       });
//     });

//     const { data } = response as { status: number; data: any };

//     console.log(data)

//     const users = data?.instanceList?.map((event: any) => ({
//       "unid": event.unid,
//       "dbTime": event.dbTime,
//       "hwTime": event.hwTime,
//       "evtCode": event.evtCode ? event.evtCode : null,
//       "evtCodeAndSubCode": event.evtCodeAndSubCode ? event.evtCodeAndSubCode : null,
//       "evtControllerRef": event.evtControllerRef ? event.evtControllerRef : null,
//       "evtCredHolderRef": event.evtCredHolderRef ? event.evtCredHolderRef : null,
//       "evtCredRef": event.evtCredRef ? event.evtCredRef : null,
//       "evtDevRef": event.evtDevRef ? event.evtDevRef : null,
//       "bgColor": event.bgColor ? event.bgColor : null
//     }));

//     const eventList = await locals.pb?.collection('atlas_events').getFullList({sort: '-created'});
//     const existingUnids = new Set(eventList?.map((user: any) => user.unid));

//     //   console.log(users)
//     //   // Save the transformed data to the database
//     const results = [];
//     for (const user of users) {
//       if (!existingUnids.has(user.unid)) {
//         const result = await locals.pb?.collection('atlas_events').create(user, {
//           $autoCancel: false
//         });
//         // console.log(user)
//         results.push(result);
//       }
//     }
//     console.log(results);


//     return new Response(JSON.stringify({ message: `Successfully saved user data`, eventList }), {
//       status: 200,
//       headers: {
//         'Content-Type': 'application/json'
//       }
//     });
//   } catch (error: any) {
//     return new Response(JSON.stringify({ error: error.message }), {
//       status: 500,
//       headers: {
//         'Content-Type': 'application/json'
//       }
//     });
//   }
// }




import type { RequestHandler, RequestEvent } from "@sveltejs/kit";
import http from 'http';
import Agent, { HttpsAgent } from 'agentkeepalive';

export const POST: RequestHandler = async ({ request, locals, cookies }: RequestEvent) => {
  const { serverIP, serverPort , token } = await request.json();
  // const sessionToken = cookies.get('sessionToken'); // Retrieve sessionToken from cookies
  const sessionTokenLocal = '378775786'; // Retrieve sessionToken from cookies
  const url = `https://${serverIP}:${serverPort}/evt/list`;

  const agent = new HttpsAgent({
    rejectUnauthorized: false // This disables certificate validation
  });

  const headers = {
    'sessionToken': `${token}` // Include the sessionToken in the Authorization header
  };

  try {
    const response = await new Promise((resolve, reject) => {
      http.get(url, { agent: agent, headers: headers }, (res: any) => { // Pass headers here
        let data = '';

        res.on('data', (chunk: any) => {
          data += chunk;
        });

        res.on('end', () => {
          if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
            resolve({ status: res.statusCode, data: JSON.parse(data) });
          } else {
            reject(new Error('Failed to authenticate'));
          }
        });
      }).on('error', (e: any) => {
        reject(e);
      });
    });

    const { data } = response as { status: number; data: any };

    console.log(data)

    const users = data?.instanceList?.map((event: any) => ({
      "unid": event.unid,
      "dbTime": event.dbTime,
      "hwTime": event.hwTime,
      "evtCode": event.evtCode ? event.evtCode : null,
      "evtCodeAndSubCode": event.evtCodeAndSubCode ? event.evtCodeAndSubCode : null,
      "evtControllerRef": event.evtControllerRef ? event.evtControllerRef : null,
      "evtCredHolderRef": event.evtCredHolderRef ? event.evtCredHolderRef : null,
      "evtCredRef": event.evtCredRef ? event.evtCredRef : null,
      "evtDevRef": event.evtDevRef ? event.evtDevRef : null,
      "bgColor": event.bgColor ? event.bgColor : null,
      "tag": serverIP
    }));

    const eventList = await locals.pb?.collection('atlas_events').getFullList({});
    const existingUnids = new Set(eventList?.map((user: any) => user.unid));

    //   console.log(users)
    //   // Save the transformed data to the database
    const results = [];
    for (const user of users) {
      if (!existingUnids.has(user.unid)) {
        const result = await locals.pb?.collection('atlas_events').create(user, {
          $autoCancel: false
        });
        // console.log(user)
        results.push(result);
      }
    }
    console.log(results);

    const eventListLatest = await locals.pb?.collection('atlas_events').getFullList({
      filter: `tag = "${serverIP}"`
    });
    return new Response(JSON.stringify({ message: `Successfully saved user data`, eventListLatest }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
}