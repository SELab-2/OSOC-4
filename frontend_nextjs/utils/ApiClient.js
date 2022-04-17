import axios from 'axios';
import {getCsrfToken, getSession} from 'next-auth/react';
import {log} from "./logger";


class Engine {
    baseUrl = process.env.NEXT_API_URL;

    names = {
        editions: "editions",
        users: "users",
        current_edition: "current_edition",
        students: "students",
        projects: "projects",
        questiontags: "questiontags",
        skills: "skills"
    }

    _paths = {
        editions: null,
        users: null,
        current_edition: null,
        students: null,
        projects: null,
        questiontags: null,
        skills: null
    }
    _year = null;
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

    _config(accessToken, csrfToken) {
        return {"headers": {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
                "Authorization": `Bearer ${accessToken}`,
                "X-CSRF-TOKEN": csrfToken}}
    }

    async getUrl(name = null, year = null, context = null) {
        if (!this._ready) {await this._setup(year, context);}
        if (!this._paths[name]) {throw Error( `UrlManager not properly instantiated, UrlManager path for '${name}' is undefined`);}
        return this._paths[name];
    }

    async _getJson(name = null, params = {}, year = null, context = null) {
        if (!this._ready) {await this._setup(year, context);}
        if (!this._paths[name]) {throw Error( `UrlManager not properly instantiated, UrlManager path for '${name}' is undefined`);}
        const session = await this._session(context);
        const csrfToken = await this._csrfToken(context);
        const res = await axios.get(this._paths[name], { ...(this._config(session.accessToken, csrfToken)), params: params });
        return res.data
    }

    async getJson(url, params = {}, year = null, context = null) {
        if (!url) {throw Error( `UrlManager not properly instantiated, UrlManager.getJson : 'url' is undefined`);}
        const session = await this._session(context);
        const csrfToken = await this._csrfToken(context);
        const res = await axios.get(url, { ...(this._config(session.accessToken, csrfToken)), params: params });
        return res.data;
    }

    async getEditions(params = {}, year = null, context = null) {
        return await this._getJson(this.names.editions, params, year, context);
    }

    async getUsers(params = {}, year = null, context = null) {
        return await this._getJson(this.names.users, params, year, context);
    }

    async getCurrentEdition(params = {}, year = null, context = null) {
        return await this._getJson(this.names.current_edition, params, year, context);
    }

    async getStudents(params = {}, year = null, context = null) {
        return await this._getJson(this.names.students, params, year, context);
    }

    async getProjects(params = {}, year = null, context = null) {
        return await this._getJson(this.names.projects, params, year, context);
    }

    async getSkills(params = {}, year = null, context = null){
        return await this._getJson(this.names.skills, params, year, context);
    }

    async getQuestionTags(params = {}, year = null, context = null) {
        return await this._getJson(this.names.questiontags, params, year, context);
    }


    async _setup(year = null, context = null) {
        log("Engine:setup");
        const session = await this._session(context);
        const csrfToken = await this._csrfToken(context);
        if (!session) {throw Error("Engine:_setup: session is undefined");}

        // set up all urls
        const config = this._config(session.accessToken, csrfToken);
        let res = await axios.get(this.baseUrl, config);
        this._paths.editions = res.data[this.names.editions];
        this._paths.users = res.data[this.names.users];
        this._paths.skills = res.data[this.names.skills];
        if (year) {
            this._paths.current_edition = this._paths.editions + "/" + year;
        } else { // get the latest edition if any
            let res = await axios.get(this._paths.editions, config);
            this._paths.current_edition = (res.data.length)? res.data[0] : null;
        }
        if (this._paths.current_edition) {
            let editionData = await axios.get(this._paths.current_edition, config);
            this._year = editionData.data["year"];
            this._paths.students = editionData.data[this.names.students];
            this._paths.projects = editionData.data[this.names.students];
            this._paths.questiontags = editionData.data[this.names.questiontags];
        }
    }
    async setCurrentEdition(year = null) {
        this._year = year;
        this.invalidate();
    }

}

export const engine = new Engine()


function AxiosClient(auth_headers = true) {
    const defaultOptions = {
        baseURL: engine.baseUrl,
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
};

export const ApiClient = AxiosClient(false);

export const AuthApiClient = AxiosClient();