export const ssr = false;

import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ fetch,cookies,locals }) => {


    // const safeExecute = async (fn: () => Promise<any>, fallbackValue: any = []) => {
    //     try {
    //         const result = await fn();
    //         console.log(result)
    //         return result !== null && result !== undefined ? result : fallbackValue;
    //     } catch (error) {
    //         console.error(`Error executing function: ${error}`);
    //         return fallbackValue;
    //     }
    // };

    const safeExecute = async (fn: () => Promise<any>, fallbackValue: any = []) => {
        try {
            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Request timed out')), 30000)
            );
            const result = await Promise.race([fn(), timeoutPromise]);
            // console.log(result);
            return result !== null && result !== undefined ? result : fallbackValue;
        } catch (error) {
            console.error(`Error executing function: ${error}`);
            return fallbackValue;
        }
    };

    // await fetch(`https://api.moksa.ai/store/getUserStoreDetailsByUserId/${locals.user.record.moksaId}`, {
    //     headers: {
    //         "Content-Type": "application/json",
    //         'Authorization': `Bearer ${cookies.get('moksa-token')}`
    //     },
    // }).then(async (res) => {
    //     const data = await res.json();
    //     console.log(data)
    // })

    const today = new Date();
    const oneYearAgo = new Date(today);
    const oneWeekAgo = new Date(today);
    oneYearAgo.setFullYear(today.getFullYear() - 1);
    oneWeekAgo.setDate(today.getDate() - 7);

    const formatDate = (date: Date) => date.toISOString().split('T')[0];

// console.log(formatDate(oneWeekAgo))
// console.log(formatDate(oneYearAgo))
// console.log(formatDate(today))
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
        const efficiency = await fetch(`https://api.moksa.ai/store/storeEmployee/getEmployeeEfficiencyByStoreid/-1/${formatDate(oneWeekAgo)}/1/100/${formatDate(today)}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${cookies.get('moksa-token')}`
            }
        });
        return efficiency.json();
    }

    const safetyDetails = async () => {
        const safetyDetails = await fetch(`https://api.moksa.ai/store/storeEmployee/getSafetyDetailsOfAllEmployeesByStore/-1/1/100/${formatDate(oneWeekAgo)}/${formatDate(today)}`, {
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

    const apiCalls = {
        theftData: () => theftDetectionDetails(),
        stores: () => dropwdown(),
        allstoreData: () => allStoreData(),
        aisleData: () => aisleData(),
        theftandcamera: () => alltheftandcamera(),
        busyness: () => busyness(),
        efficiency: () => efficiency(),
        safetyDetails: () => safetyDetails(),
        usersData: () => allUsers(),
        userStoreDetails: async () => {
            const res = await fetch(`https://api.moksa.ai/store/getUserStoreDetailsByUserId/${locals.user.record.moksaId}`, {
                headers: {
                    "Content-Type": "application/json",
                    'Authorization': `Bearer ${cookies.get('moksa-token')}`
                },
            });
            return res.json();
        }
    };

    const results = await Promise.all(
        Object.entries(apiCalls).map(async ([key, fn]) => {
            const value = await safeExecute(fn);
            return [key, value];
        })
    );


    // return {
    //     theftData: await safeExecute(theftDetectionDetails),
    //     stores: await safeExecute(dropwdown),
    //     allstoreData: await safeExecute(allStoreData),
    //     aisleData: await safeExecute(aisleData),
    //     theftandcamera: await safeExecute(alltheftandcamera),
    //     busyness: await safeExecute(busyness),
    //     efficiency: await safeExecute(efficiency),
    //     safetyDetails: await safeExecute(safetyDetails),
    //     moksaToken: cookies.get('moksa-token'),
    //     usersData: await safeExecute(allUsers),
    //     userStoreDetails: await safeExecute(async () => {
    //         const res = await fetch(`https://api.moksa.ai/store/getUserStoreDetailsByUserId/${locals.user.record.moksaId}`, {
    //             headers: {
    //                 "Content-Type": "application/json",
    //                 'Authorization': `Bearer ${cookies.get('moksa-token')}`
    //             },
    //         });
    //         return res.json();
    //     }, null)
    // };
    return {
        ...Object.fromEntries(results),
        moksaToken: cookies.get('moksa-token')
    };
};
