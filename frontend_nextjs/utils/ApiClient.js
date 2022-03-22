import axios from 'axios';
import { getSession, getCsrfToken } from 'next-auth/react';

const baseURL = 'http://192.168.0.102:8000';

const ApiClient = () => {
    const defaultOptions = {
        baseURL,
    };

    const instance = axios.create(defaultOptions);

    instance.interceptors.request.use(async (request) => {
        const session = await getSession();
        const csrfToken = await getCsrfToken()

        console.log("session")
        console.log(session)
        console.log(csrfToken)
        if (session) {
            request.headers.Authorization = `Bearer ${session.accessToken}`;
            request.headers["X-CSRF-TOKEN"] = csrfToken
        }
        console.log(request)
        console.log(request.headers)
        return request;
    });

    instance.interceptors.response.use(
        (response) => {
            return response;
        },
        (error) => {
            console.log(`error`, error);
        },
    );

    return instance;
};

export default ApiClient();