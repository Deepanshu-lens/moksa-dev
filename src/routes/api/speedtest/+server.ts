// import fetch from 'node-fetch';
// import NetworkSpeed from 'network-speed';  // ES5

// export async function GET(req) {
//     const testNetworkSpeed = new NetworkSpeed();

//     async function getNetworkDownloadSpeed() {
//         const baseUrl = 'https://eu.httpbin.org/stream-bytes/500000';
//         const fileSizeInBytes = 500000;
//         const speed = await testNetworkSpeed.checkDownloadSpeed(baseUrl, fileSizeInBytes);
//         console.log(speed);
//         return speed;
//     }

// const res = await getNetworkDownloadSpeed()
// console.log(res)
//     return {
//         body: {
//             downloadSpeed: res
//         }
//     };
//     // };
// }


import NetworkSpeed from 'network-speed';

export async function GET(req) {
    const testNetworkSpeed = new NetworkSpeed();

    async function getNetworkDownloadSpeed() {
        const baseUrl = 'https://eu.httpbin.org/stream-bytes/500000';
        const fileSizeInBytes = 500000;
        const speed = await testNetworkSpeed.checkDownloadSpeed(baseUrl, fileSizeInBytes);
        return speed;
    }

    const res = await getNetworkDownloadSpeed();
    console.log(res);

    return new Response(JSON.stringify({ downloadSpeed: res }), {
        headers: {
            'Content-Type': 'application/json'
        }
    });
}