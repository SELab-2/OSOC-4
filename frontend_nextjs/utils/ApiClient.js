import axios from 'axios';
import { getCsrfToken, getSession } from 'next-auth/react';
import { log } from "./logger";


/**
 * A class that represents an url, you can use it to make http requests (GET, PATCH, ...)
 *  it uses the Api class to handle session tokens
 */
export class Url {
    _url = null;
    _name = null;
    _extension = "";
    _headers = {};
    _params = {};
    _body = {};

    _useAuth = false;

    /**
     * The constructor, you shouldn't use this one, but rather use the functions Url.fromname() or Url.fromUrl
     * @param name: from api.[name], other strings won't be accepted
     * @param url: any url
     * @param useAuth: whether the request requires authentication (session tokens) or not
     */
    constructor(name, url, useAuth) {
        this._name = name;
        this._url = url;
        this._useAuth = useAuth;
    }

    /**
     * Creates an instance of Url from a name of the api
     *  Example: Url.fromName(api.students)
     * @param name: from api.[name], other strings won't be accepted
     * @param useAuth: whether the request requires authentication (session tokens) or not
     * @returns {Url}
     */
    static fromName(name, useAuth = true) {
        return new Url(name, null);
    }

    /**
     * Creates an instance of Url from an url
     *  Example: Url.fromUrl("http://localhost:8000/students/32753")
     * @param url: any url
     * @param useAuth: whether the request requires authentication (session tokens) or not
     * @returns {Url}
     */
    static fromUrl(url, useAuth = true) {
        return new Url(null, url);
    }

    /**
     * This will set an extension (or suffix) to append to the url
     *  Example: Url.fromName(api.students).extend("/create") will have the url for students but with "/create" appended at the end
     * @param extension: the suffix / extension (string)
     * @returns {Url}
     */
    extend(extension = "") {
        this._extension = extension;
        return this;
    }

    /**
     * This will set params, used for filtering, sorting, searching, ...
     * @param params: a dictionary
     * @returns {Url}
     */
    setParams(params = {}) {
        this._params = params;
        return this;
    }

    /**
     * This will set a body, used for POST or PATCH
     * @param body: a dictionary
     * @returns {Url}
     */
    setBody(body) {
        this._body = body;
        return this;
    }

    /**
     * Prepares to send a request:
     *  - initializes the url if this was created with Url.fromName()
     *  - adds the extension to the url
     *  - initializes the headers
     * @param context
     * @returns {Promise<void>}
     * @private
     */
    async _setupRequest(context = null) {
        if (!this._name && !this._url) { throw Error(`ApiPath not properly instantiated, 'url' and 'name' are undefined`); }
        this._headers = await api.getHeaders(context, this._useAuth);
        if (!this._url) { this._url = await api.getUrl(this._name, context); }
        this._url += this._extension;
    }

    /**
     * Makes a GET request to its url
     * @param context: when making a request from server-side you need to provide the context, this is needed to get a session
     * @param student: denotes whether the request was for a student or not.
     * @returns {Promise<{success: boolean, error}|{data: any, success: boolean}>}
     */
    async get(context = null, student = false) {
        try {
            await this._setupRequest(context);
            log(`API: GET ${this._url}`)
            if (student) {

                const session = await api.getSession(context);
                const res = await cache.getStudent(this._url, session["userid"])

                return { success: true, data: res }
            }
            const resp = await axios.get(this._url, { "headers": this._headers, "params": this._params });
            return { success: true, data: resp.data };
        } catch (e) {
            console.log(e)
            return { success: false, error: e };
        }
    }

    /**
     * Makes a POST request to its url
     * @param context: when making a request from server-side you need to provide the context, this is needed to get a session
     * @returns {Promise<{success: boolean, error}|{data: any, success: boolean}>}
     */
    async post(context = null) {
        try {
            await this._setupRequest(context);
            log(`API: POST ${this._url}`)
            const resp = await axios.post(this._url, this._body, { "headers": this._headers });
            return { success: true, data: resp.data };
        } catch (e) {
            return { success: false, error: e };
        }
    }

    /**
     * Makes a PATCH request to its url
     * @param context: when making a request from server-side you need to provide the context, this is needed to get a session
     * @returns {Promise<{success: boolean, error}|{data: any, success: boolean}>}
     */
    async patch(context = null) {
        try {
            await this._setupRequest(context);
            log(`API: PATCH ${this._url}`)
            const resp = await axios.patch(this._url, this._body, { "headers": this._headers });
            return { success: true, data: resp.data };
        } catch (e) {
            return { success: false, error: e };
        }
    }

    /**
     * Makes a DELETE request to its url
     * @param context: when making a request from server-side you need to provide the context, this is needed to get a session
     * @returns {Promise<{success: boolean, error}|{data: any, success: boolean}>}
     */
    async delete(context = null) {
        try {
            await this._setupRequest(context);
            log(`API: DELETE ${this._url}`)
            const resp = await axios.delete(this._url, { "headers": this._headers });
            return { success: true, data: resp.data };
        } catch (e) {
            return { success: false, error: e };
        }
    }

}


/**
 * A class that manages the api urls, makes creating Url requests much easier
 */
class API {
    baseUrl = process.env.NEXT_API_URL;
    // todo
    login = "login";
    forgot = "forgot";
    invite = "invite";
    resetpassword = "resetpassword";

    // the year of the current edition
    year = null;

    // the api.[name] fields
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
    participations = "participations";
    emailtemplates = "emailtemplates";
    sendemails = "sendemails"

    // the paths, the key should be the value of the api.[name]
    //            the value should be the url
    _paths = {
        // todo
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
        skills: null,
        participations: null,
        emailtemplates: null,
        sendemails: null
    }
    _ready = false;

    /**
     * Invalidates the api, this will cause it to set itself up again on the next request
     */
    invalidate() {
        this._ready = false;
    }

    /**
     * Returns the session object
     * @param context: for server-side requests
     * @returns {Promise<Session>}
     * @private
     */
    async getSession(context = null) {
        if (context) { return await getSession(context); }
        else { return await getSession(); }
    }

    /**
     * Returns the csrfToken
     * @param context: for server-side requests
     * @returns {Promise<string>}
     * @private
     */
    async getCsrfToken(context = null) {
        if (context) { return await getCsrfToken(context); }
        else { return await getCsrfToken(); }
    }

    /**
     * Returns the headers needed
     * @param context: for server-side requests
     * @param useAuth: if the url is public, set this to true, so you don't use auth headers
     * @returns {Promise<{Authorization: string, "Access-Control-Allow-Origin": string, "X-CSRF-TOKEN": string, "Content-Type": string}|{"Access-Control-Allow-Origin": string, "Content-Type": string}>}
     * @private
     */
    async getHeaders(context = null, useAuth = true) {
        let headers = {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
        }
        if (!useAuth) { return headers; }
        const session = await this.getSession(context);
        const csrfToken = await this.getCsrfToken(context);
        if (!session) { return headers; }
        return {
            ...headers,
            "Authorization": `Bearer ${session.accessToken}`,
            "X-CSRF-TOKEN": csrfToken
        }
    }

    /**
     * Returns the url for a name in the api (use api.[name])
     * @param name: the name you want the url for (use api.[name])
     * @param context: for server-side requests
     * @returns {Promise<*>}
     */
    async getUrl(name = null, context = null) {
        if (!this._ready) { await this._setup(context); }
        if (!this._paths[name]) { throw Error(`UrlManager not properly instantiated, UrlManager path for '${name}' is undefined`); }
        return this._paths[name];
    }

    /**
     * Set up the urls in _paths
     * @param context: for server-side requests
     * @returns {Promise<void>}
     * @private
     */
    async _setup(context = null) {
        log("Engine:setup");
        try {
            const session = await this.getSession(context);
            if (!session) { throw Error("Engine:_setup: session is undefined"); }

            // set up all urls
            const headers = await this.getHeaders(context);
            const config = { "headers": headers };
            this._paths.me = session.userid;
            let res = await axios.get(this.baseUrl, config);
            this._paths.students = res.data[this.students];
            this._paths.projects = res.data[this.projects];
            this._paths.editions = res.data[this.editions];
            this._paths.users = res.data[this.users];
            this._paths.skills = res.data[this.skills];
            this._paths.participations = res.data[this.participations];
            this._paths.emailtemplates = res.data[this.emailtemplates];
            this._paths.sendemails = res.data[this.sendemails];
            if (this.year) {
                this._paths.current_edition = this._paths.editions + "/" + this.year;
            } else { // get the latest edition if any
                let res = await axios.get(this._paths.editions, config);
                this._paths.current_edition = (res.data.length) ? res.data[0] : null;
            }
            if (this._paths.current_edition) {
                let editionData = await axios.get(this._paths.current_edition, config);
                this.year = editionData.data["year"];
                this._paths.editions_students = editionData.data[this.students];
                this._paths.editions_projects = editionData.data[this.projects];
                this._paths.editions_questiontags = editionData.data["questiontags"];
            }
        } catch (e) {
            log("API: setup failed")
            log(e)
        }

    }

    /**
     * Set the current edition to another year
     * @param year: the year of the edition to make requests to
     */
    setCurrentEdition(year = null) {
        log("API: changing edition to: " + year)
        this.year = year;
        this.invalidate();
    }
}

export const api = new API();

class Cache {
    cache = {};

    async getStudent(url, userid) {
        let student = cache[url];
        if (student) {
            return student
        }

        student = Url.fromUrl(url).get().then(res => {
            if (res.success) {
                console.log(res)
                res = res.data;
                Object.values(res["suggestions"]).forEach((item, index) => {
                    if (item["suggested_by_id"] === userid) {
                        res["own_suggestion"] = item;
                    }
                });
                cache[url] = res;
                return res;
            }
        })
        if (student) {
            return student
        }
        return undefined;
    }

    async updateCache(newdata, userid) {
        const data = JSON.parse(newdata)

        if ("suggestion" in data) {
            let student = cache[data["suggestion"]["student_id"]]
            if (student) {
                let new_student = student
                new_student["suggestions"][data["id"]] = data["suggestion"];
                if (data["suggestion"]["suggested_by_id"] === userid) {
                    new_student["own_suggestion"] = data["suggestion"];
                }
                cache[data["suggestion"]["student_id"]] = new_student;
            }

        } else if ("decision" in data) {
            let student = cache[data["id"]]
            if (student) {
                let new_student = student
                new_student["decision"] = data["decision"]["decision"];
                cache[data["id"]] = new_student
            }
        }
    }

    async clear() {
        Object.keys(cache).map(key => delete cache[key]);
    }

}

export const cache = new Cache();
