import axios from 'axios';
import { getSession, getCsrfToken } from 'next-auth/react';

const baseURL = process.env.NEXT_API_URL;


function AxiosClient(auth_headers = true) {
    const defaultOptions = {
        baseURL: baseURL,
    };

    const instance = axios.create(defaultOptions);

    instance.interceptors.request.use(async (request) => {
        request.headers["Content-Type"] = "application/json"
        request.headers["Access-Control-Allow-Origin"] = "*"
        if (auth_headers) {
            const session = await getSession();
            const csrfToken = await getCsrfToken()

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