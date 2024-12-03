import type { RequestHandler, RequestEvent } from "@sveltejs/kit";
import http from 'http';
import Agent, { HttpsAgent } from 'agentkeepalive';

export const POST: RequestHandler = async ({ request, locals, cookies }: RequestEvent) => {
  const { serverIP, serverPort,username, password } = await request.json();

  console.log(serverIP,serverPort,username,password)
  const url = `https://${serverIP}:${serverPort}/authenticate?username=${username}&password=${password}&apiClientType=2`;
  // const url = `https://${serverIP}:${serverPort}/authenticate?username=admin&password=ZKTeco123!&apiClientType=2`;
console.log(url)
  const agent = new HttpsAgent({
    rejectUnauthorized: false // This disables certificate validation
  });

  try {
    const response = await new Promise((resolve, reject) => {
      http.get(url, { agent: agent }, (res: any) => {
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
    const sessionToken = data.sessionToken;
    console.log(sessionToken)

    if(sessionToken === undefined) {
    return new Response(JSON.stringify({ error: "Authentication failed. Invalid session token." }), {
      status: 401,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    }

    //@ts-ignore
    // cookies.set('sessionToken', sessionToken, { httpOnly: true, path: '/', maxAge: 36000000 });
    const cookie = `token=${sessionToken}; HttpOnly; Max-Age=${ 30 * 24 * 60 * 60}; SameSite=Strict; Path=/`;


    return new Response(JSON.stringify({ message: data }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json', 'Set-Cookie': cookie
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