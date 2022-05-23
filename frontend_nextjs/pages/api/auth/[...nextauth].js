import axios from 'axios';
import NextAuth from 'next-auth';
import CredentialsProvider from "next-auth/providers/credentials";
import { getCsrfToken } from 'next-auth/react';
import { log } from "../../../utils/logger";

/**
 * This function refreshes the access token using the refresh token.
 * @param tokenObject The new access token or an error.
 * @returns {Promise<(*&{error: string})|(*&{accessTokenExpires: number, accessToken: *, refreshToken: *})>}
 */
async function refreshAccessToken(tokenObject) {
    const csrfToken = await getCsrfToken()
    try {
        log("sending refresh request")
        // Get a new set of tokens with a refreshToken

        const url = process.env.NEXT_INTERNAL_API_URL;

        // get the refreshed access token
        const tokenResponse = await axios.post(url + "/refresh", {}, { headers: { "Authorization": "Bearer " + tokenObject.refreshToken, 'X-CSRF-TOKEN': csrfToken } });

        return {
            ...tokenObject,
            accessToken: tokenResponse.data.accessToken,
            accessTokenExpires: Date.now() + tokenResponse.data.accessTokenExpiry * 1000,
            refreshToken: tokenObject.refreshToken
        }
    } catch (error) {
        return {
            ...tokenObject,
            error: "RefreshAccessTokenError",
        }
    }
}


// A list of providers to sign in with
const providers = [
    CredentialsProvider({
        name: 'Credentials',
        authorize: async (credentials) => {
            try {
                // Authenticate user with credentials
                const user = await axios.post(process.env.NEXT_INTERNAL_API_URL + "/login", { "email": credentials.email, "password": credentials.password }, { "headers": { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } });

                user.data = user.data.data

                if (user.data["accessToken"]) {
                    return user.data;
                }
                return null;
            } catch (e) {
                throw new Error(e);
            }
        }
    })
]

// these callbacks are run when new access token is received
const callbacks = {
    jwt: async ({ token, user }) => {
        if (user) {
            // This will only be executed at login. Each next invocation will skip this part.
            token.accessToken = user["accessToken"];
            token.accessTokenExpires = Date.now() + user["accessTokenExpiry"] * 1000;
            token.refreshToken = user["refreshToken"];
            token.userid = user["id"]
        }

        // If the token is still valid, just return it.
        if (Date.now() < token.accessTokenExpires) {
            return Promise.resolve(token);
        }

        console.log("yeah facking mong")

        // If the call arrives after 23 hours have passed, we allow to refresh the token.
        token = refreshAccessToken(token);
        return Promise.resolve(token);
    },
    session: async ({ session, token }) => {
        // Here we pass accessToken to the client to be used in authentication with your API
        session.accessToken = token.accessToken;
        session.accessTokenExpires = token.accessTokenExpires;
        session.error = token.error;
        session.userid = token.userid

        return Promise.resolve(session);
    },
    redirect: async ({ url, baseUrl }) => {

        if (process.env.NODE_ENV === "production") {
            return url.replace("http://localhost:3000", process.env.BASE_URL);
        }
        return url;
    }
}

// custom cookies config is used in production so multiple branch deployments use different cookies
export const options = (process.env.NODE_ENV === "development") ? {
    providers,
    callbacks,
    pages: {
        signIn: '/login',
    },
    secret: 'e8ae5c5d5cd7f0f1bec2303ad04a7c80f09f759d480a7a5faff5a6bbaa4078d0',
} : {
    providers,
    callbacks,
    pages: {
        signIn: '/login',
    },
    secret: 'e8ae5c5d5cd7f0f1bec2303ad04a7c80f09f759d480a7a5faff5a6bbaa4078d0'
}


const Auth = (req, res) => NextAuth(req, res, options)
export default Auth;