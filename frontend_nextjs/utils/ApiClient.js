import axios from 'axios';
import {getCsrfToken, getSession} from 'next-auth/react';
import {log} from "./logger";


export class Url {
    _url = null;
    _name = null;
    _extension = "";
    _headers = {};
    _params = {};
    _body = {};

    constructor(name, url) {
        this._name = name;
        this._url = url;
    }

    static fromName(name) {
        return new Url(name, null);
    }

    static fromUrl(url) {
        return new Url(null, url);
    }

    extend(extension = "") {
        this._extension = extension;
        return this;
    }

    setParams(params = {}) {
        this._params = params;
        return this;
    }

    setBody(body) {
        this._body = body;
        return this;
    }

    async get(context = null) {
        if (!this._name && !this._url) {throw Error(`ApiPath not properly instantiated, 'name' is undefined`);}
        this._headers = await api._headers(context);
        if (!this._url) {this._url = await api.getUrl(this._name, context);}
        try {
            const resp = await axios.get(this._url + this._extension, {"headers": this._headers, "params": this._params });
            return {success: true, data: resp.data};
        } catch (e) {
            return {success: false, error: e};
        }
    }

    async post(context = null) {
        if (!this._name) {throw Error(`ApiPath not properly instantiated, 'url' is undefined`)}
        this._headers = await api._headers(context);
        if (!this._url) {this._url = await api.getUrl(this._name, context);}
        try {
            const resp = await axios.patch(this._url, this._body, this._headers);
            return {success: true, data: resp.data};
        } catch (e) {
            return {success: false, error: e};
        }
    }

    async patch(context = null) {
        if (!this._name) {throw Error(`ApiPath not properly instantiated, 'url' is undefined`)}
        this._headers = await api._headers(context);
        if (!this._url) {this._url = await api.getUrl(this._name, context);}
        try {
            const resp = await axios.patch(this._url, this._body, this._headers);
            return {success: true, data: resp.data};
        } catch (e) {
            return {success: false, error: e};
        }
    }

}


class API {
    baseUrl = process.env.NEXT_API_URL;

    year = null;

    me = "me";
    editions = "editions";
    users = "users";
    current_edition = "current_edition";
    students = "students";
    projects = "projects";
    questiontags = "questiontags";
    skills = "skills";

    _paths = {
        me: null,
        editions: null,
        users: null,
        current_edition: null,
        students: null,
        projects: null,
        questiontags: null,
        skills: null
    }
    _ready = false;

    invalidate() {
        this._ready = false;
    }

    async _session(context = null) {
        if (context) {return await getSession(context);}
        else {return await getSession();}
    }

    async _csrfToken(context = null) {
        if (context) {return await getCsrfToken(context);}
        else {return await getCsrfToken();}
    }

    async _headers(context = null) {
        const session = await this._session(context);
        const csrfToken = await this._csrfToken(context);
        if (!session) {throw Error("Engine:_setup: session is undefined");}
        return {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
                "Authorization": `Bearer ${session.accessToken}`,
                "X-CSRF-TOKEN": csrfToken
        }
    }

    async getUrl(name = null, context = null) {
        if (!this._ready) {await this._setup(context);}
        if (!this._paths[name]) {throw Error( `UrlManager not properly instantiated, UrlManager path for '${name}' is undefined`);}
        return this._paths[name];
    }

    async _setup(context = null) {
        log("Engine:setup");
        const session = await this._session(context);
        const csrfToken = await this._csrfToken(context);
        if (!session) {throw Error("Engine:_setup: session is undefined");}

        // set up all urls
        const headers = await this._headers(context);
        const config = {"headers": headers};
        this._paths.me = session.userid;
        let res = await axios.get(this.baseUrl, config);
        this._paths.editions = res.data[this.editions];
        this._paths.users = res.data[this.users];
        this._paths.skills = res.data[this.skills];
        if (this._year) {
            this._paths.current_edition = this._paths.editions + "/" + this._year;
        } else { // get the latest edition if any
            let res = await axios.get(this._paths.editions, config);
            this._paths.current_edition = (res.data.length)? res.data[0] : null;
        }
        if (this._paths.current_edition) {
            let editionData = await axios.get(this._paths.current_edition, config);
            this._year = editionData.data["year"];
            this._paths.students = editionData.data[this.students];
            this._paths.projects = editionData.data[this.projects];
            this._paths.questiontags = editionData.data[this.questiontags];
        }
    }
    async setCurrentEdition(year = null) {
        this._year = year;
        this.invalidate();
    }

}

export const api = new API();


function AxiosClient(auth_headers = true) {
    const defaultOptions = {
        baseURL: api.baseUrl,
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
}

export const ApiClient = AxiosClient(false);

export const AuthApiClient = AxiosClient();