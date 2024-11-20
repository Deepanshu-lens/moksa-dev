export const ssr = false;

import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ fetch, cookies, locals }) => {

    const safeExecute = async (fn: () => Promise<any>, fallbackValue: any = []) => {
        try {
            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Request timed out')), 10000)
            );
            const result = await Promise.race([fn(), timeoutPromise]);
            // console.log(result);
            return result !== null && result !== undefined ? result : fallbackValue;
        } catch (error) {
            console.error(`Error executing function: ${error}`);
            return fallbackValue;
        }
    };


    const today = new Date();
    const oneYearAgo = new Date(today);
    const oneWeekAgo = new Date(today);
    const mToken = cookies.get('moksa-token');
    oneYearAgo.setFullYear(today.getFullYear() - 1);
    oneWeekAgo.setDate(today.getDate() - 7);

    const formatDate = (date: Date) => date.toISOString().split('T')[0];

    // console.log(formatDate(oneWeekAgo))
    // console.log(formatDate(oneYearAgo))
    // console.log(formatDate(today))
    const dropwdown = async () => {
        const response = await fetch('https://dev.api.moksa.ai/store/getAllStoresForDropdown', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${mToken}`,
                'enableallstores': 'true'
            }
        });
        return response.json();
    }

    const allStoreData = async () => {
        const allstoreData = await fetch(`https://dev.api.moksa.ai/store/getAllStoresTotals/-1/${formatDate(oneWeekAgo)}/${formatDate(today)}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${mToken}`,

            }
        });

        const data = await allstoreData.json();
        return data;
    }

    const aisleData = async () => {
        const aisleData = await fetch(`https://dev.api.moksa.ai/store/getAllStoresWithAisleDetails/1/100/${formatDate(oneYearAgo)}/${formatDate(today)}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${mToken}`
            }
        });
        return aisleData.json();
    }

    const alltheftandcamera = async () => {
        const theftandcamera = await fetch(`https://dev.api.moksa.ai/store/getAllStoresWithTheftAndCameraDetails/1/100/${formatDate(oneYearAgo)}/${formatDate(today)}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${mToken}`
            }
        });
        return theftandcamera.json();
    }

    const theftDetectionDetails = async () => {
        const theftDetectionDetails = await fetch(`https://dev.api.moksa.ai/theft/theftDetectionDetailsByStoreid/-1`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${mToken}`,
                'Content-Type': 'application/json',
                'datetype': '7',
                'startDate': formatDate(oneWeekAgo),
                'endDate': formatDate(today),
            }
        });
        return theftDetectionDetails.json();
    }

    const busyness = async () => {
        const busyness = await fetch(`https://dev.api.moksa.ai/store/storeBusyHour/getStoreBusyHourDataForThisWeek/-1`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${mToken}`
            }
        });
        return busyness.json();
    }

    const efficiency = async () => {
        const efficiency = await fetch(`https://dev.api.moksa.ai/store/storeEmployee/getEmployeeEfficiencyByStoreidDynamic/-1/${formatDate(oneWeekAgo)}/1/100/${formatDate(today)}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${mToken}`
            }
        });
        return efficiency.json();
    }

    const safetyDetails = async () => {
        const safetyDetails = await fetch(`https://dev.api.moksa.ai/store/storeEmployee/getSafetyDetailsOfAllEmployeesByStore/-1/1/100/${formatDate(oneWeekAgo)}/${formatDate(today)}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${mToken}`
            }
        });
        return safetyDetails.json();
    }

    const storePeopleCount = async () => {
        const spc = await fetch(`https://dev.api.moksa.ai/people/getPeopleCount/-1`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${mToken}`,
                'Content-Type': 'application/json',
                'datetype': '7',
                'Pagepersize': '100',
                'Pagenumber': '1'
            }
        });
        return spc.json();
    }



    const allUsers = async () => {
        const allUsers = await fetch(`https://dev.api.moksa.ai/auth/getAllUsers/1/100`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${mToken}`
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
        busyness: () => [],
        efficiency: () => efficiency(),
        safetyDetails: () => safetyDetails(),
        usersData: () => allUsers(),
        storePeopleCount: () => storePeopleCount(),
        userStoreDetails: async () => {
            const res = await fetch(`https://dev.api.moksa.ai/store/getUserStoreDetailsByUserId/${locals.user.record.moksaId}`, {
                headers: {
                    "Content-Type": "application/json",
                    'Authorization': `Bearer ${mToken}`
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

    return {
        ...Object.fromEntries(results),
        moksaToken: mToken
    };
};
