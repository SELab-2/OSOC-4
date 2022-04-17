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

    _config(accessToken, csrfToken) {
        return {"headers": {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
                "Authorization": `Bearer ${accessToken}`,
                "X-CSRF-TOKEN": csrfToken}}
    }

    async getEditions(year = null, context = null) {
        if (!this._ready) {await this._setup(year, context); }
        if (!this._editions) {throw Error("UrlManager not properly instantiated, editions is undefined")}
        return this._editions;
    }

    async getUsers(year = null, context = null) {
        if (!this._ready) {await this._setup(year, context);}
        if (!this._editions) {throw Error("UrlManager not properly instantiated, users is undefined")}
        return this._users;
    }

    async getCurrentEdition(year = null, context = null) {
        if (!this._ready) {await this._setup(year, context);}
        if (!this._editions) {throw Error("UrlManager not properly instantiated, current edition is undefined")}
        return this._current_edition;
    }

    async getStudents(year = null, context = null) {
        if (!this._ready) {await this._setup(year, context);}
        if (!this._editions) {throw Error("UrlManager not properly instantiated, students is undefined")}
        return this._students;
    }

    async getProjects(year = null, context = null) {
        if (!this._ready) {await this._setup(year, context);}
        if (!this._editions) {throw Error("UrlManager not properly instantiated, projects is undefined")}
        return this._projects;
    }

    async getSkills(year = null, context = null){
        if (!this._ready) {await this._setup(year, context);}
        if (!this._editions) {throw Error("UrlManager not properly instantiated, skills is undefined")}
        return this._skills;
    }

    async getCurrentYear(year = null, context = null){
        if (!this._ready) {await this._setup(year, context);}
        if (!this._editions) {throw Error("UrlManager not properly instantiated, current year is undefined")}
        return this._year;
    }

    async getQuestionTags(year = null, context = null) {
        if (!this._ready) {await this._setup(year, context);}
        if (!this._editions) {throw Error("UrlManager not properly instantiated, questiontags is undefined")}
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
        const config = this._config(session.accessToken, csrfToken);
        let res = await axios.get(this.baseUrl, config);
        this._editions = res.data["editions"];
        this._users = res.data["users"];
        if (year) {
            this._current_edition = this._editions + "/" + year;
        } else { // get the latest edition if any
            let res = await axios.get(this._editions, config);
            this._current_edition = (res.data.length)? res.data[0] : null;
        }
        if (this._current_edition) {
            let editionData = await axios.get(this._current_edition, config);
            this._year = editionData.data['year'];
            this._students = editionData.data["students"];
            this._projects = editionData.data["projects"];
            this._questiontags = editionData.data["questiontags"];
        }
    }
    async setCurrentEdition(year = null) {
        this._year = year;
        this.invalidate();
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