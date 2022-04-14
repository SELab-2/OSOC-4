import axios from 'axios';
import { getSession, getCsrfToken } from 'next-auth/react';
import {log} from "./logger";


class UrlManager {
    baseUrl = process.env.NEXT_API_URL;
    _editions = null;
    _users = null;
    _year = null;
    _current_edition = null;
    _students = null;
    _projects = null;
    _questiontags = null;
    _skills = null;

    _ready = false;

    invalidate() {
        this._ready = false;
    }

    async getEditions(year = null, context = null) {
        if (!this._ready) {await this._setup(year, context); }
        return this._editions;
    }

    async getUsers(year = null, context = null) {
        if (!this._ready) { await this._setup(year, context); }
        return this._users;
    }

    async getCurrentEdition(year = null, context = null) {
        if (!this._ready) { await this._setup(year, context); }
        return this._current_edition;
    }

    async getStudents(year = null, context = null) {
        if (!this._ready) { await this._setup(year, context); }
        return this._students;
    }

    async getProjects(year = null, context = null) {
        if (!this._ready) { await this._setup(year, context); }
        return this._projects;
    }

    async getSkills(year = null, context = null){
        if (!this._ready) { await this._setup(year, context); }
        return this._skills;
    }

    async getCurrentYear(year = null, context = null){
        if (!this._ready) { await this._setup(year, context); }
        return this._year;
    }

    async getQuestionTags(year = null, context = null) {
        if (!this._ready) { await this._setup(year, context); }
        return this._questiontags;
    }


    async _setup(year = null, context = null) {
        log("UrlManager:setup");
        this._skills = this.baseUrl + "/skills"; //TODO make this not hardcoded
        let session, csrfToken;
        if (context) {
            session = await getSession(context);
            csrfToken = await getCsrfToken(context);
        } else {
            session = await getSession();
            csrfToken = await getCsrfToken();
        }
        if (!session) {throw Error("UrlManager:_setup: session is undefined");}

        // set up all urls
        let config = {"headers": {
                "Authorization": `Bearer ${session.accessToken}`,
                "X-CSRF-TOKEN": csrfToken}}
        let res = await axios.get("", config);
        this._editions = res["editions"];
        this._users = res["users"];
        if (year) {
            this._current_edition = this._editions + "/" + year;
        } else {
            let res = await axios.get(this._editions, config);
            this._current_edition = (res.length)? res[0] : null;
        }
        if (this._current_edition) {
            let editionData = await axios.get(this._current_edition, config);
            this._year = editionData['year'];
            this._students = editionData["students"];
            this._projects = editionData["projects"];
            this._questiontags = editionData["questiontags"];
        }
    }
}

export const urlManager = new UrlManager()


function AxiosClient(auth_headers = true) {
    const defaultOptions = {
        baseURL: urlManager.baseUrl,
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