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

    _useAuth = false;

    constructor(name, url, useAuth) {
        this._name = name;
        this._url = url;
        this._useAuth = useAuth;
    }

    static fromName(name, useAuth = false) {
        return new Url(name, null);
    }

    static fromUrl(url, useAuth = false) {
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
        if (!this._name && !this._url) {throw Error(`ApiPath not properly instantiated, 'url' and 'name' are undefined`);}
        this._headers = await api._headers(context, this._useAuth);
        if (!this._url) {this._url = await api.getUrl(this._name, context) + this._extension;}
        try {
            console.log(`API: GET ${this._url}`)
            const resp = await axios.get(this._url, {"headers": this._headers, "params": this._params });
            return {success: true, data: resp.data};
        } catch (e) {
            return {success: false, error: e};
        }
    }

    async getPublic(context = null) {
        if (!this._name && !this._url) {throw Error(`ApiPath not properly instantiated, 'url' and 'name' are undefined`);}
        this._headers = await api._headers(context, this._useAuth);
        if (!this._url) {this._url = await api.getUrl(this._name, context) + this._extension;}
        try {
            console.log(`API: GET ${this._url}`)
            const resp = await axios.get(this._url, {"headers": this._headers, "params": this._params });
            return {success: true, data: resp.data};
        } catch (e) {
            return {success: false, error: e};
        }
    }

    async post(context = null) {
        if (!this._name && !this._url) {throw Error(`ApiPath not properly instantiated, 'url' and 'name' are undefined`)}
        this._headers = await api._headers(context, this._useAuth);
        if (!this._url) {this._url = await api.getUrl(this._name, context) + this._extension;}
        try {
            console.log(`API: POST ${this._url}`)
            const resp = await axios.post(this._url, this._body, {"headers": this._headers});
            return {success: true, data: resp.data};
        } catch (e) {
            return {success: false, error: e};
        }
    }

    async patch(context = null) {
        if (!this._name && !this._url) {throw Error(`ApiPath not properly instantiated, 'url' and 'name' are undefined`)}
        this._headers = await api._headers(context, this._useAuth);
        if (!this._url) {this._url = await api.getUrl(this._name, context)  + this._extension;}
        try {
            console.log(`API: PATCH ${this._url}`)
            const resp = await axios.patch(this._url, this._body, {"headers": this._headers});
            return {success: true, data: resp.data};
        } catch (e) {
            return {success: false, error: e};
        }
    }

    async delete(context = null) {
        if (!this._name && !this._url) {throw Error(`ApiPath not properly instantiated, 'url' and 'name' are undefined`)}
        this._headers = await api._headers(context, this._useAuth);
        if (!this._url) {this._url = await api.getUrl(this._name, context)  + this._extension;}
        try {
            console.log(`API: DELETE ${this._url}`)
            const resp = await axios.delete(this._url, {"headers": this._headers});
            return {success: true, data: resp.data};
        } catch (e) {
            return {success: false, error: e};
        }
    }

}


class API {
    baseUrl = process.env.NEXT_API_URL;
    login = "login";
    forgot = "forgot";
    invite = "invite";
    resetpassword = "resetpassword";


    year = null;

    me = "me";
    students = "students"
    projects = "projects"
    editions = "editions";
    users = "users";
    current_edition = "current_edition";
    editions_students = "editions_students";
    edition_projects = "editions_projects";
    editions_questiontags = "editions_questiontags";
    skills = "skills";

    _paths = {
        login: this.baseUrl + "/login",
        forgot: this.baseUrl + "/forgot",
        invite: this.baseUrl + "/invite",
        resetpassword: this.baseUrl + "/resetpassword",

        me: null,
        students: null,
        projects: null,
        editions: null,
        users: null,
        current_edition: null,
        editions_students: null,
        editions_projects: null,
        editions_questiontags: null,
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

    async _headers(context = null, isPublic = false) {
        let headers = {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
        }
        if (isPublic) {return headers;}
        const session = await this._session(context);
        const csrfToken = await this._csrfToken(context);
        if (!session) {return headers;}
        return {
                ...headers,
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
        try {
            const session = await this._session(context);
            const csrfToken = await this._csrfToken(context);
            if (!session) {throw Error("Engine:_setup: session is undefined");}

            // set up all urls
            const headers = await this._headers(context);
            const config = {"headers": headers};
            this._paths.me = session.userid;
            let res = await axios.get(this.baseUrl, config);
            console.log("PIPO")
            console.log(res)
            this._paths.students = res.data[this.students];
            this._paths.projects = res.data[this.projects];
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
                this._paths.editions_students = editionData.data[this.students];
                this._paths.editions_projects = editionData.data[this.projects];
                this._paths.editions_questiontags = editionData.data["questiontags"];
            }
        } catch (e) {
            console.log("API: setup failed")
        }

    }
    async setCurrentEdition(year = null) {
        this._year = year;
        this.invalidate();
    }

}

export const api = new API();
