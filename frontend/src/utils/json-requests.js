import axios from "axios";
import router from "../router";
import {log} from "./logger";
import Cookies from 'js-cookie';

axios.defaults.withCredentials = true
axios.defaults.baseURL = import.meta.env.VITE_API_URL || "http://localhost:8000";

let _config = {"headers": {"Content-Type": "application/json",
        "Access-Control-Allow-Origin": "<origin>"}}

export function headers(getters, commit) {
    log("json-requests: updating headers")
    let cookie = Cookies.get('csrf_access_token');
    if (cookie) {
        _config["headers"]["X-CSRF-TOKEN"] = cookie;
        if (! getters.getIsAuthenticated) {
            commit('setIsAuthenticated', true);}
        log("json-requests: updating headers: now with cookie")
    }
    else {
        delete _config["headers"]["X-CSRF-TOKEN"];
        if (getters.getIsAuthenticated) {
            commit('setIsAuthenticated', false);}
        log("json-requests: updating headers: now without cookie")
    }
    return _config;
}

export function isStillAuthenticated() {
    const cookie = Cookies.get('csrf_access_token');
    log("json-requests: isStillAuthenticated: " + Boolean(cookie));
    return cookie
}
/**
 * redirects to another url
 * @param name the name where to redirect to, as defined in router/index.js
 * @param params additional params too pass on to the page
 * @returns {Promise<void>}
 */
export async function redirect(name, params = {}) {
    log("json-requests: redirect: to " + name)
    await router.push({name: name, params: params});
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
export async function getJson(url, getters, commit) {
    log("json-requests: getJson: " + url)
    try {
        const req = await axios.get(url, headers(getters, commit));
        return req.data;
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
        const req = await axios.delete(url, headers(getters, commit));
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
export async function postCreate(url, json, getters, commit) {
    log("json-requests: postCreate: " + url)
    try {
        let resp = await axios.post(url, json, headers(getters, commit))
        return {
            success: true,
            data: resp.data};
    } catch (e) {
        if (e.response.status === 400 && e.response.data.message) {
            return { success: false,
                data: e.response.data.message};
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
            data: (await axios.patch(url, json, headers(getters, commit))).data.url};
    } catch (e) {
        if (e.response.status === 400 && e.response.data.message) {
            return { success: false,
                data: e.response.data.message};
        } else {
            await catchError(e);
            return "";
        }
    }
}


export async function login(url, json, getters, commit) {
    log("json-requests: login")
    try {
        let resp = await axios.post(url, json, headers(getters, commit));
        log(resp)
        commit('setIsAuthenticated', true);
        return {success: true};
    } catch (e) {
        log(e)
        await catchError(e);
        return "";
    }
}

export async function logout(url, getters, commit) {
    log("json-requests: logout")
    try {
        let resp = await axios.delete(url, headers(getters, commit));
        log(resp)
        commit('setIsAuthenticated', false);
        return {success: true};
    } catch (e) {
        log(e)
        return await catchError(e);
    }
}







