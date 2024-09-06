export const ssr = false;

import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ fetch,cookies,locals }) => {

    console.log(locals?.user.record.moksaId)
    await fetch(`https://api.moksa.ai/store/getUserStoreDetailsByUserId/${locals.user.record.moksaId}`, {
        headers: {
            "Content-Type": "application/json",
            'Authorization': `Bearer ${cookies.get('moksa-token')}`
        },
    }).then(async (res) => {
        const data = await res.json();
        console.log(data)
    })
    // if (!cookies.get('moksa-token')) {
    //     await fetch(`https://api.moksa.ai/auth/login`, {
    //         method: "POST", headers: {
    //             'Content-Type': 'application/json'
    //         },
    //         body: JSON.stringify({ email: 'anushiya@gmail.com', password: 'anushiya' }),
    //     }).then(async (res) => {
    //         const data = await res.json();
    //         // console.log(data);
    //         if (data.data && data.data.token) {
    //             const token = data.data.token;
    //             // Set the token in a cookie
    //             const cookieOptions = {
    //                 httpOnly: true,
    //                 secure: false,
    //                 sameSite: "lax",
    //                 domain: undefined,
    //                 maxAge: 60 * 60 * 23
    //             };
    //             // console.log("TOKEN!!!!!!!!!!")
    //             cookies.set('moksa-token', token, cookieOptions);
    //             // console.log('Token saved in cookie');
    //         } else {
    //             console.log('Token not found in response');
    //         }
    //     }).catch((err) => {
    //         console.log(err);
    //     });
    // } 
    // else {
    //     cookies.delete('moksa-token', { path: '/' });
    //     await fetch(`https://api.moksa.ai/auth/login`, {
    //         method: "POST", headers: {
    //             'Content-Type': 'application/json'
    //         },
    //         body: JSON.stringify({ email: 'anushiya@gmail.com', password: 'anushiya' }),
    //     }).then(async (res) => {
    //         const data = await res.json();
    //         // console.log(data);
    //         if (data.data && data.data.token) {
    //             const token = data.data.token;
    //             // Set the token in a cookie
    //             const cookieOptions = {
    //                 httpOnly: true,
    //                 secure: false,
    //                 sameSite: "lax",
    //                 domain: undefined,
    //                 maxAge: 60 * 60 * 23
    //             };
    //             // console.log("TOKEN!!!!!!!!!!")
    //             cookies.set('moksa-token', token, cookieOptions);
    //             // console.log('Token saved in cookie');
    //         } else {
    //             console.log('Token not found in response');
    //         }
    //     }).catch((err) => {
    //         console.log(err);
    //     });
    // }
    // console.log(cookies.get('moksa-token'))
    const today = new Date();
    const oneYearAgo = new Date(today);
    const oneWeekAgo = new Date(today);
    oneYearAgo.setFullYear(today.getFullYear() - 1);
    oneWeekAgo.setDate(today.getDate() - 7);

    const formatDate = (date: Date) => date.toISOString().split('T')[0];


    const dropwdown = async () => {
        const response = await fetch('https://api.moksa.ai/store/getAllStoresForDropdown', {
            method: 'GET',
          headers: {
            'Authorization': `Bearer ${cookies.get('moksa-token')}`
          }
        });
      return response.json();
    }

    const allStoreData = async () => {   
        const allstoreData = await fetch(`https://api.moksa.ai/store/getAllStoresTotals/${formatDate(oneYearAgo)}/${formatDate(today)}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${cookies.get('moksa-token')}`
            }
        });
        return allstoreData.json();
    }

    const aisleData = async () => {
        const aisleData = await fetch(`https://api.moksa.ai/store/getAllStoresWithAisleDetails/1/10/${formatDate(oneYearAgo)}/${formatDate(today)}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${cookies.get('moksa-token')}`
            }
        });
        return aisleData.json();
    }

    const alltheftandcamera = async () => {
        const theftandcamera = await fetch(`https://api.moksa.ai/store/getAllStoresWithTheftAndCameraDetails/1/50/${formatDate(oneYearAgo)}/${formatDate(today)}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${cookies.get('moksa-token')}`
            }
        });
        return theftandcamera.json();
    }
    
    const theftDetectionDetails = async () => {
        const theftDetectionDetails = await fetch(`https://api.moksa.ai/theft/theftDetectionDetailsByStoreid/-1`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${cookies.get('moksa-token')}`,
                'Content-Type': 'application/json',
                'datetype': '7',
                'startDate': formatDate(oneWeekAgo),
                'endDate': formatDate(today),
            }
        });
        return theftDetectionDetails.json();
    }

    const busyness = async () => {
        const busyness = await fetch(`https://api.moksa.ai/store/storeBusyHour/getStoreBusyHourDataForThisWeek/-1`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${cookies.get('moksa-token')}`
            }
        });
        return busyness.json();
    }

    const efficiency = async () => {
        const efficiency = await fetch(`https://api.moksa.ai/store/storeEmployee/getEmployeeEfficiencyByStoreid/-1/${formatDate(oneWeekAgo)}/1/10/${formatDate(today)}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${cookies.get('moksa-token')}`
            }
        });
        return efficiency.json();
    }

    const safetyDetails = async () => {
        const safetyDetails = await fetch(`https://api.moksa.ai/store/storeEmployee/getSafetyDetailsOfAllEmployeesByStore/-1/1/10/${formatDate(oneWeekAgo)}/${formatDate(today)}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${cookies.get('moksa-token')}`
            }
        });
        return safetyDetails.json();
    }



    const allUsers = async () => {
        const allUsers = await fetch(`https://api.moksa.ai/auth/getAllUsers/1/100`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${cookies.get('moksa-token')}`
            }
        });
        return allUsers.json();
    }

    const safeExecute = async (fn: () => Promise<any>) => {
        try {
            return await fn() || [];
        } catch (error) {
            console.error(`Error executing function: ${error}`);
            return [];
        }
    };

    return {
        theftData: await safeExecute(theftDetectionDetails),
        stores: await safeExecute(dropwdown),
        allstoreData: await safeExecute(allStoreData),
        aisleData: await safeExecute(aisleData),
        theftandcamera: await safeExecute(alltheftandcamera),
        busyness: await safeExecute(busyness),
        efficiency: await safeExecute(efficiency),
        safetyDetails: await safeExecute(safetyDetails),
        moksaToken: cookies.get('moksa-token'),
        usersData: await safeExecute(allUsers)
    };
};
