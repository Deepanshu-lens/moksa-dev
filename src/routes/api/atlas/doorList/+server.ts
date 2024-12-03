// import type { RequestHandler, RequestEvent } from "@sveltejs/kit";
// import http from 'http';
// import Agent, { HttpsAgent } from 'agentkeepalive';

// export const POST: RequestHandler = async ({ request, locals, cookies }: RequestEvent) => {
//   const {token,serverIP,serverPort} = await request.json()
//   const url = `https://${serverIP}:${serverPort}/door/list`;

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
//       "name": event.name,
//       "version": event.version,
//       "address": event.address ? event.address : null,
//       "physicalParent": event.physicalParent ? event.physicalParent : null,
//       "lastModified": event.lastModified ? event.lastModified : null,
//       "doorConfig": event.doorConfig ? event.doorConfig : null,
//       "logicalChildren": event.logicalChildren ? event.logicalChildren : null,
//     }));


//     const doorList = await locals.pb?.collection('atlas_doors').getFullList({sort: '-created'});
//     console.log(doorList)

//     const existingUnids = new Set(doorList?.map((user: any) => user.unid));

//     const results = [];
//     for (const user of users) {
//       if (!existingUnids.has(user.unid)) {
//         const result = await locals.pb?.collection('atlas_doors').create(user, {
//           $autoCancel: false
//         });
//         results.push(result);
//       }
//     }
//     console.log(results);


//     return new Response(JSON.stringify({ message: `Successfully saved user data`, doorList }), {
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

  const url = `https://${serverIP}:${serverPort}/door/list`;

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
      "name": event.name,
      "version": event.version,
      "address": event.address ? event.address : null,
      "physicalParent": event.physicalParent ? event.physicalParent : null,
      "lastModified": event.lastModified ? event.lastModified : null,
      "doorConfig": event.doorConfig ? event.doorConfig : null,
      "logicalChildren": event.logicalChildren ? event.logicalChildren : null,
      "tag": serverIP
    }));


    const doorList = await locals.pb?.collection('atlas_doors').getFullList({});
    console.log(doorList)

    const existingUnids = new Set(doorList?.map((user: any) => user.unid));






    const results = [];
    for (const user of users) {
      if (!existingUnids.has(user.unid)) {
        const result = await locals.pb?.collection('atlas_doors').create(user, {
          $autoCancel: false
        });
        results.push(result);
      }
    }
    console.log(results);

    const doorListLatest = await locals.pb?.collection('atlas_doors').getFullList({
      filter: `tag = "${serverIP}"`
    });

    return new Response(JSON.stringify({ message: `Successfully saved user data`, doorListLatest }), {
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