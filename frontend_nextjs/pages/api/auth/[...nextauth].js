import axios from 'axios';
import NextAuth from 'next-auth';
import CredentialsProvider from "next-auth/providers/credentials";

async function refreshAccessToken(tokenObject) {
    try {
        // Get a new set of tokens with a refreshToken
        const tokenResponse = await axios.post("http://192.168.0.102:8000/refresh", {
            Authorization: "Bearer " + tokenObject.refreshToken
        }, { headers: { 'CSRF-Token': tokenObject.csrfToken } }
        );

        return {
            ...tokenObject,
            accessToken: tokenResponse.data.accessToken,
            accessTokenExpiry: tokenResponse.data.accessTokenExpiry,
            refreshToken: tokenResponse.data.refreshToken
        }
    } catch (error) {
        return {
            ...tokenObject,
            error: "RefreshAccessTokenError",
        }
    }
}

const providers = [
    CredentialsProvider({
        name: 'Credentials',
        authorize: async (credentials) => {
            try {
                console.log(credentials)
                // Authenticate user with credentials
                const user = await axios.post("http://192.168.0.102:8000/login", {
                    password: credentials.password,
                    email: credentials.email
                });

                user.data = user.data.data
                console.log("testting....")

                if (user.data["accessToken"]) {
                    return user.data;
                }
                console.log("testting....")
                return null;
            } catch (e) {
                console.log(e);
                throw new Error(e);
            }
        }
    })
]

const callbacks = {
    jwt: async ({ token, user }) => {
        if (user) {
            // This will only be executed at login. Each next invocation will skip this part.
            token.accessToken = user["accessToken"];
            token.accessTokenExpiry = user["accessTokenExpiry"];
            token.refreshToken = user["refreshToken"];
            token.userid = user["id"]
        }

        console.log(token);
        // If accessTokenExpiry is 24 hours, we have to refresh token before 24 hours pass.
        const shouldRefreshTime = Math.round((token.accessTokenExpiry - 60 * 60 * 1000) - Date.now());

        // If the token is still valid, just return it.
        if (shouldRefreshTime > 0) {
            return Promise.resolve(token);
        }

        // If the call arrives after 23 hours have passed, we allow to refresh the token.
        token = refreshAccessToken(token);
        return Promise.resolve(token);
    },
    session: async ({ session, token }) => {
        // Here we pass accessToken to the client to be used in authentication with your API
        session.accessToken = token.accessToken;
        session.accessTokenExpiry = token.accessTokenExpiry;
        session.error = token.error;
        session.userid = token.userid

        return Promise.resolve(session);
    },
}

export const options = {
    providers,
    callbacks,
    pages: {
        signIn: '/login',
    },
    secret: 'e8ae5c5d5cd7f0f1bec2303ad04a7c80f09f759d480a7a5faff5a6bbaa4078d0',
    debug: true
}

const Auth = (req, res) => NextAuth(req, res, options)
export default Auth;