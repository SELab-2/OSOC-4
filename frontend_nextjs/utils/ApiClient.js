import axios from 'axios';
import { getSession, getCsrfToken } from 'next-auth/react';
import {getJson} from "./json-requests";

class UrlManager {
    baseUrl = process.env.NEXT_API_URL;
    _editions = null;
    _users = null;
    _year = null;
    _current_edition = null;
    _students = null;
    _projects = null;

    async getEditions() {
        if (this._editions) {return this._editions;}
        await this._setEditions()
        return this._editions;
    }

    async getUsers() {
        if (this._users) {return this._users;}
        await this._setUsers();
        return this._users;
    }

    async getCurrentEdition() {
        if (this._current_edition) {return this._current_edition;}
        await this._setCurrentEdition()
        return this._current_edition;
    }

    async getStudents() {
        if (this._students) {return this._students;}
        await this._setStudents();
        return this._students;
    }

    async getProjects() {
        if (this._projects) {return this._projects;}
        await this._setProjects();
        return this._projects;
    }


    async _setUsers() {
        let res = await getJson("");
        this._editions = res["editions"];
        this._users = res["users"];
    }

    async _setEditions() {
        let res = await getJson("");
        this._editions = res["editions"];
        this._users = res["users"];
    }

    async _setCurrentEdition(year = null) {
        if (!this._editions) {await this._setEditions();}
        let editionData;
        if (!this._year) {
            let res = await getJson(this._editions);
            this._current_edition = res[0];
            editionData = await getJson(this._current_edition);
            this._year = res['year'];
        } else {
            this._year = year;
            this._current_edition = this._editions + "/" + this._year;
            editionData = await getJson(this._current_edition);
        }
        this._students = editionData["students"];
        this._projects = editionData["projects"];
    }

    async _setStudents() {
        await this._setCurrentEdition();
    }

    async _setProjects() {
        await this._setCurrentEdition();
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