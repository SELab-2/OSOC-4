import axios from 'axios';
import { getSession, getCsrfToken } from 'next-auth/react';
import {getJson} from "./json-requests";

class UrlCache {
    baseUrl = process.env.NEXT_API_URL;
    editions = null;
    users = null;
    current_edition = null;
    current_edition_paths = {students: null, projects:null};
}

export const urlCache = new UrlCache()

export const setupUrlCacheOnLogin = async function () {
    console.log("starting setup url cache");

    let res = await getJson("");
    urlCache.editions = res["editions"];
    urlCache.users = res["users"];

    res = await getJson(urlCache.editions)
    urlCache.current_edition = res[0]

    res = await getJson(urlCache.current_edition)
    urlCache.current_edition_paths.students = res["students"]
    urlCache.current_edition_paths.projects = res["projects"]

    console.log("setup url cache complete")
    console.log(urlCache)
}

function AxiosClient(auth_headers = true) {
    const defaultOptions = {
        baseURL: urlCache.baseUrl,
    };

    const instance = axios.create(defaultOptions);

    instance.interceptors.request.use(async (request) => {
        request.headers["Content-Type"] = "application/json"
        request.headers["Access-Control-Allow-Origin"] = "*"

        if (auth_headers) {
            const session = await getSession();
            const csrfToken = await getCsrfToken();
            if (session) {
                request.headers.Authorization = `Bearer ${session.accessToken}`;
                request.headers["X-CSRF-TOKEN"] = csrfToken
            }
        }
        console.log(request)
        return request;
    });

    instance.interceptors.response.use(
        (response) => {
            return response;
        },
        (error) => {
            console.log(`error`, error);
            throw error;
        },
    );

    return instance;
};

export const ApiClient = AxiosClient(false);

export const AuthApiClient = AxiosClient();