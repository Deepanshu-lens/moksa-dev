// import type { RequestHandler, RequestEvent } from "@sveltejs/kit";
// import http from 'http';
// import Agent, { HttpsAgent } from 'agentkeepalive';

// export const POST: RequestHandler = async ({ request, locals, cookies }: RequestEvent) => {
//     const {token,serverIP,serverPort} = await request.json()
//     const url = `https://${serverIP}:${serverPort}/credHolder/list`;

//     const agent = new HttpsAgent({
//       rejectUnauthorized: false // This disables certificate validation
//     });

//     const headers = {
//       'sessionToken': `${token}` // Include the sessionToken in the Authorization header
//     };

//     try {
//       const response = await new Promise((resolve, reject) => {
//         http.get(url, { agent: agent, headers: headers }, (res:any) => { // Pass headers here
//           let data = '';

//           res.on('data', (chunk:any) => {
//             data += chunk;
//           });

//           res.on('end', () => {
//             if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
//               resolve({ status: res.statusCode, data: JSON.parse(data) });
//             } else {
//               reject(new Error('Failed to authenticate'));
//             }
//           });
//         }).on('error', (e:any) => {
//           reject(e);
//         });
//       });

//       const { data } = response as { status: number; data: any };

//       const users = data?.instanceList?.map((user: { unid: any; first: any; last: any; phones: string | any[]; emails: string | any[]; enabled: any; version: any; lastModified: any; creds: any; }) => ({
//         "unid": user.unid,
//         "firstName": user.first,
//         "LastName": user.last,
//         "phoneNumber": user.phones.length > 0 ? user.phones[0].phoneNumber : "N/A",
//         "email": user.emails.length > 0 ? user.emails[0].emailAddress : null,
//         "enabled": user.enabled,
//         "version": user.version,
//         "lastModified": user.lastModified,
//         "cred": JSON.stringify(user.creds)
//       }));

//       const userList = await locals.pb?.collection('atlas_users').getFullList({sort: '-created'});

//       console.log(userList);
//       console.log(users);

//       const existingUnids = new Set(userList?.map((user: any) => user.unid));

//       const results = [];
//       for (const user of users) {
//         if (!existingUnids.has(user.unid)) {
//           console.log(user)
          
//           const result = await locals.pb?.collection('atlas_users').create(user);
//           results.push(result);
//         }
//       }
//       console.log(results);

//       return new Response(JSON.stringify({ message: `Successfully saved user data`, userList }), {
//         status: 200,
//         headers: {
//           'Content-Type': 'application/json'
//         }
//       });
//     } catch (error: any) {
//       return new Response(JSON.stringify({ error: error.message }), {
//         status: 500,
//         headers: {
//           'Content-Type': 'application/json'
//         }
//       });
//     }
// }

import type { RequestHandler, RequestEvent } from "@sveltejs/kit";
import http from 'http';
import Agent, { HttpsAgent } from 'agentkeepalive';

export const POST: RequestHandler = async ({ request, locals, cookies }: RequestEvent) => {
  const { serverIP, serverPort , token } = await request.json();
    const url = `https://${serverIP}:${serverPort}/credHolder/list`;

    const agent = new HttpsAgent({
      rejectUnauthorized: false // This disables certificate validation
    });

    const headers = {
      'sessionToken': `${token}` // Include the sessionToken in the Authorization header
    };

    try {
      const response = await new Promise((resolve, reject) => {
        http.get(url, { agent: agent, headers: headers }, (res:any) => { // Pass headers here
          let data = '';

          res.on('data', (chunk:any) => {
            data += chunk;
          });

          res.on('end', () => {
            if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
              resolve({ status: res.statusCode, data: JSON.parse(data) });
            } else {
              reject(new Error('Failed to authenticate'));
            }
          });
        }).on('error', (e:any) => {
          reject(e);
        });
      });

      const { data } = response as { status: number; data: any };

      const users = data?.instanceList?.map((user: { unid: any; first: any; last: any; phones: string | any[]; emails: string | any[]; enabled: any; version: any; lastModified: any; creds: any; }) => ({
        "unid": user.unid,
        "firstName": user.first,
        "LastName": user.last,
        "phoneNumber": user.phones.length > 0 ? user.phones[0].phoneNumber : "N/A",
        "email": user.emails.length > 0 ? user.emails[0].emailAddress : null,
        "enabled": user.enabled,
        "version": user.version,
        "lastModified": user.lastModified,
        "cred": JSON.stringify(user.creds),
        "tag": serverIP
      }));

      const userList = await locals.pb?.collection('atlas_users').getFullList({});

      console.log(userList);
      console.log(users);

      const existingUnids = new Set(userList?.map((user: any) => user.unid));

      const results = [];
      for (const user of users) {
        if (!existingUnids.has(user.unid)) {
          console.log(user)
          
          const result = await locals.pb?.collection('atlas_users').create(user);
          results.push(result);
        }
      }
      console.log(results);
      const userListLatest = await locals.pb?.collection('atlas_users').getFullList({
        filter: `tag = "${serverIP}"`
      });
      return new Response(JSON.stringify({ message: `Successfully saved user data`, userListLatest }), {
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