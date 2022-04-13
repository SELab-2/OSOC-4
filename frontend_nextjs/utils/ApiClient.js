import axios from 'axios';
import { getSession, getCsrfToken } from 'next-auth/react';
import { getJson } from "./json-requests";
import { log } from "./logger";

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

    async getEditions() {
        log("Getting editions")
        if (this._editions) { return this._editions; }
        await this._setEditions()
        return this._editions;
    }

    async getUsers() {
        log("Getting users")

        if (this._users) { return this._users; }
        await this._setUsers();
        return this._users;
    }

    async getCurrentEdition() {
        log("getting current edition")
        if (this._current_edition) { return this._current_edition; }
        await this._setCurrentEdition()
        return this._current_edition;
    }

    async getStudents(orderby = null, search = null) {
        await this._setStudents(orderby, search);
        return this._students;
    }

    async getProjects() {
        if (this._projects) { return this._projects; }
        await this._setProjects();
        return this._projects;
    }

    async getSkills(){
        if (! this._skills) { await this._setSkills() }
        return this._skills;
    }

    async getCurrentYear(){
        if(! this._year) {await this._setCurrentEdition();}
        return this._year;
    }

    async getQuestionTags() {
        if (this._questiontags) { return this._questiontags; }
        await this._setQuestionTags();
        return this._questiontags;
    }


    async _setUsers() {
        log("Setting users")
        let res = await getJson("");
        this._editions = res["editions"];
        this._users = res["users"];
    }

    async _setEditions() {
        log("Setting editions")
        let res = await getJson("");
        this._editions = res["editions"];
        this._users = res["users"];
    }

    async _setCurrentEdition(year = null) {
        log("Setting current editions")
        if (!this._editions) { await this._setEditions(); }
        if (year) {
            this._year = year;
            this._current_edition = this._editions + "/" + this._year;
        } else {
            let res = await getJson(this._editions);
            this._current_edition = res[0];
        }
        let editionData = await getJson(this._current_edition);
        this._year = editionData['year'];
        this._students = editionData["students"];
        this._projects = editionData["projects"];
        this._questiontags = editionData["questiontags"];
    }

    async _setStudents(orderby = null, search = null) {
        await this._setCurrentEdition();
        let filtersUrl = "";
        if (orderby) {
            filtersUrl += "&orderby=" + orderby;
        }
        if (search) {
            filtersUrl += "&search=" + search;
        }
        if (filtersUrl) {
            filtersUrl = "?" + filtersUrl.slice(1);
        }
        this._students += filtersUrl;
    }

    async _setProjects() {
        await this._setCurrentEdition();
    }

    async _setQuestionTags() {
        await this._setCurrentEdition();
    }

    //TODO make this not hardcoded
    async _setSkills(){
        this._skills = "/skills"
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