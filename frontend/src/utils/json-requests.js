import axios from "axios";
import router from "../router";

const config = {headers: {"Content-Type": "application/json", "Access-Control-Allow-Origin": "<origin>"}};

/**
 * redirects to another url
 * @param name the name where to redirect to, as defined in router/index.js
 * @param params additional params too pass on to the page
 * @returns {Promise<void>}
 */
export async function redirect(name, params = {}) {
    await router.push({name: name, params: params});
}


/**
 * Respond to an error by constructing an error page & redirecting
 * @param e
 * @returns {Promise<undefined>}
 */
async function catch_error(e) {
    const params = {
        status: e.response.status,
        message: e.response.data.message || e.response.data // If there is no message, the error is in .data for some reason (ex. 404's)
    };

    // Add status text in case it exists
    if (e.response.statusText !== undefined) {
        params.status = `${params.status} | ${e.response.statusText}`
    }

    await redirect("ErrorPage", params);

    return undefined;
}


/**
 * Send a GET-request to an endpoint & return the JSON data.
 * In case of an invalid request, redirects to the error page & returns undefined.
 * @param url the URL to send the request to
 * @returns {Promise<undefined|*>}
 */
export async function get_json(url) {
    try {
        const req = await axios.get(url, config);
        return req.data;
    } catch (e) {
        return await catch_error(e);
    }
}


/**
 * Send a DELETE-request to an endpoint & return the returned JSON.
 * In case of an invalid request, redirects to the error page & returns undefined.
 * @param url the URL to send the request to
 * @returns {Promise<undefined|any>}
 */
export async function send_delete(url) {
    try {
        const req = await axios.delete(url, config);
        return req.data;
    } catch (e) {
        return await catch_error(e);
    }
}


/**
 * Send a POST-request to an endpoint & return the returned JSON data.
 * In case of an invalid request, redirects to the error page & returns undefined.
 * @param url the URL to send the request to
 * @param json the data
 * @returns {Promise<string|{data, success: boolean}>}
 */
export async function postCreate(url, json) {
    try {
        return {
            success: true,
            data: (await axios.post(url, json, config)).data.url};
    } catch (e) {
        if (e.response.status === 400 && e.response.data.message) {
            return { success: false,
                data: e.response.data.message};
        } else {
            await catch_error(e);
            return "";
        }
    }
}


/**
 * Send a PATCH-request to an endpoint & return the returned JSON data.
 * In case of an invalid request, redirects to the error page & returns undefined.
 * @param url the URL to send the request to
 * @param json the data
 * @returns {Promise<string|{data, success: boolean}>}
 */
export async function patchEdit(url, json) {
    try {
        return {
            success: true,
            data: (await axios.patch(url, json, config)).data.url};
    } catch (e) {
        if (e.response.status === 400 && e.response.data.message) {
            return { success: false,
                data: e.response.data.message};
        } else {
            await catch_error(e);
            return "";
        }
    }
}

