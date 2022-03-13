import axios from "axios";
import router from "../router";
import Cookies from 'js-cookie';

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

export class Engine {
    constructor() {
        axios.defaults.withCredentials = true
        this._headers = {"Content-Type": "application/json",
                "Access-Control-Allow-Origin": "<origin>"}
    }

    headers() {
        return {"headers": this._headers}
    }


    /**
     * Send a GET-request to an endpoint & return the JSON data.
     * In case of an invalid request, redirects to the error page & returns undefined.
     * @param url the URL to send the request to
     * @returns {Promise<undefined|*>}
     */
    async get_json(url) {
        try {
            const req = await axios.get(url, this.headers());
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
    async send_delete(url) {

        try {
            const req = await axios.delete(url, this.headers());
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
    async postCreate(url, json) {
        console.log(json)
        try {
            let resp = await axios.post(url, json, this.headers())
            return {
                success: true,
                data: resp.data};
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
    async patchEdit(url, json) {
        try {
            return {
                success: true,
                data: (await axios.patch(url, json, this.headers())).data.url};
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


    async login(url, json) {
        try {
            console.log("sending login req");
            await axios.post(url, json, this.headers());
            this._headers['X-CSRF-TOKEN'] = Cookies.get('csrf_access_token');
            console.log("headers updated");
            return {
                success: true,
                };
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

    async logout(url) {
        try {
            console.log("sending logout req")
            const req = await axios.delete(url, this.headers());
            delete this._headers['X-CSRF-TOKEN']
            return req.data;
        } catch (e) {
            return await catch_error(e);
        }
    }

}





