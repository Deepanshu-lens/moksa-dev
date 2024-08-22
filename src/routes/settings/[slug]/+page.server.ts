export const ssr = false;

import { error, type Load } from "@sveltejs/kit";

const validateEmailFormat = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

export const actions = {
    updateEmail: async ({ request, locals }) => {
        const data = Object.fromEntries(await request.formData());
        console.log(data);
        if (data.email) {
            const valid = validateEmailFormat(data.email);
            if (!valid) {
                return {
                    success: false,
                };
            }
        }
        try {
            const token = locals.user.token;
            console.log(token);
            const res = await locals.pb
                ?.collection("users")
                .requestEmailChange(data.email);
            console.log(res);
        } catch (err) {
            console.log("here");
            throw error(err.status, err.message);
        }

        return {
            success: true,
        };
    },
    updatePass: async ({ request, locals }) => {
        const data = Object.fromEntries(await request.formData());
        console.log(data);
        try {
            await locals.pb?.collection("users").requestPasswordReset(data.email);
            return {
                success: true,
            };
        } catch (err) {
            console.log("error:", err);
            throw error(500, "something went wrong!");
        }
    },
};

export const load: Load = async ({ url, locals }) => {
    // const queryParams = url.searchParams;
    // const user = queryParams.get("section");

    // if (user === "User") {
    console.log("getting login events & user logs");

    try {

        // const response = await fetch('https://atlas.zktecousa.xyz:8086/authenticate?username=admin&password=ZKTeco123!&apiClientType=2', {
        //   method: 'GET',
        //   headers: {
        //     'Content-Type': 'application/json',
        //     'Access-Control-Allow-Origin': '*',
        //   },
        //   rejectUnauthorized: false,//add when working with https sites
        // requestCert: false,//add when working with https sites
        // agent: false,//add when working with https sites
        // });

        // const responseData = await response.json();
        // console.log(responseData);
        const loginRecords = await locals.pb
            ?.collection("loginEvents")
            .getFullList({
                filter: `email~"${locals?.user?.record?.email}"`,
                sort: "-created",
            });

        const simpleList = loginRecords.map((item) => ({
            id: item.id,
            email: item.email,
            created: item.created,
        }));

        const userLogs = await locals.pb?.collection("userLogs").getFullList({
            filter: `email~"${locals?.user?.record?.email}"`,
            sort: "-created",
        });

        const logList = userLogs.map((item) => ({
            id: item.id,
            email: item.email,
            event: item.event,
            created: item.created,
        }));

        // const allFeatures = await locals.pb?.collection("feature").getFullList();

        // const featureList = allFeatures.map((item) => ({
        //   feature: item.feature,
        // }));

        return {
            records: simpleList,
            logs: logList,
            // features: featureList,
        };
    } catch (err) {
        console.error("Failed to get full list:", err);
        throw error(500, `Failed to load full list ${err}`);
    }
    // }
};
