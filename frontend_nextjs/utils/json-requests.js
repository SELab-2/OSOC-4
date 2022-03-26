import axios from "axios";
import { log } from "./logger";
import Cookies from 'js-cookie';
import { ApiClient, AuthApiClient } from './ApiClient'

const nobase = axios.create({
    withCredentials: true,
})

// axios.defaults.withCredentials = true
// todo fix base url with env var
// axios.defaults.baseURL = process.env.PUBLIC_URL || "http://localhost:8000";


/**
 * redirects to another url
 * @param name the name where to redirect to, as defined in router/index.js
 * @param params additional params too pass on to the page
 * @returns {Promise<void>}
 */
export async function redirect(name, params = {}) {
    log("json-requests: redirect: to " + name)
    // await router.push({name: name, params: params});
    // todo figure out how redirects work in react

}


/**
 * Respond to an error by constructing an error page & redirecting
 * @param e
 * @returns {Promise<undefined>}
 */
export async function catchError(e) {
    log("json-requests: catchError: " + e)
    let params = {}
    // Add status in case it exists
    if (e.status !== undefined) {
        params.status = e.status
    }
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
export async function getJson(url) {
    log("json-requests: getJson: " + url)
    try {
        let response = await AuthApiClient.get(url);
        return response.data;
    } catch (e) {
        return await catchError(e);
    }
}

/**
 * Send a DELETE-request to an endpoint & return the returned JSON.
 * In case of an invalid request, redirects to the error page & returns undefined.
 * @param url the URL to send the request to
 * @returns {Promise<undefined|any>}
 */
export async function sendDelete(url, getters, commit) {
    log("json-requests: sendDelete: " + url)
    try {
        const req = await AuthApiClient.delete(url);
        return req.data;
    } catch (e) {
        return await catchError(e);
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
    log("json-requests: postCreate: " + url)
    try {
        const resp = await AuthApiClient.post(url, json);

        return {
            success: true,
            data: resp.data
        };
    } catch (e) {
        if (e.response.status === 400 && e.response.data.message) {
            return {
                success: false,
                data: e.response.data.message
            };
        } else {

            await catchError(e);
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
export async function patchEdit(url, json, getters, commit) {
    log("json-requests: patchEdit: " + url)
    try {
        return {
            success: true,
            data: (await AuthApiClient.patch(url, json)).data.url
        };
    } catch (e) {
        if (e.response.status === 400 && e.response.data.message) {
            return {
                success: false,
                data: e.response.data.message
            };
        } else {
            await catchError(e);
            return "";
        }
    }
}


export async function login(json) {
    log("json-requests: login")
    const base = process.env.NEXT_INTERNAL_API_URL || "";
    try {
        let resp = await ApiClient.post(base + "/login", json);
        log(resp)
        return { success: true, data: resp.data };
    } catch (e) {
        log(e)
        return { success: false };
    }
}
export async function forgot(json) {
    log("json-requests: login")
    try {
        let resp = await ApiClient.post("/forgot", json);
        log(resp)
        return { success: true, msg: resp.data.msg };
    } catch (e) {
        log(e)
        return { success: false };
    }
}

export async function logout(url) {
    log("json-requests: logout")
    try {
        let resp = await AuthApiClient.delete(url);
        log(resp)
        return { success: true };
    } catch (e) {
        log(e)
        return await catchError(e);
    }
}

export async function check_invitekey(invitekey) {
    try {
        await ApiClient.get(`/invite/${invitekey}`)
        return true;
    } catch (e) {
        log(e)
        return false;
    }

}

export async function set_password(invitekey, json) {
    try {
        await ApiClient.get(`/invite/${invitekey}`, json)
        return true;
    } catch (e) {
        log(e)
        return await catchError(e);
    }
}






