import PocketBase from "pocketbase";

const getPocketBaseURL = () => {
    if (typeof window === "undefined") {
        // Server-side logic
        return process.env.PUBLIC_POCKETBASE_URL || "http://localhost:8090";
    } else {
        // Client-side logic
        const hostname = window.location.hostname;
        const isProduction = import.meta.env.PUBLIC_ENV === "production";
        return isProduction
            ? import.meta.env.PUBLIC_POCKETBASE_URL
            : `http://${hostname}:8090`;
    }
};

const pb = new PocketBase(getPocketBaseURL());

export default pb;