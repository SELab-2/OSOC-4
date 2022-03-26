import useSWR from 'swr';
import axios from 'axios'
import { getJson, isStillAuthenticated } from "../utils/json-requests";
import { useEffect, useState } from "react";

//check if you are on the client (browser) or server
const isBrowser = () => typeof window !== "undefined";

const ProtectedRoute = ({ router, children }) => {
    //Identify authenticated user
    let [loggedInAs, setLoggedInAs] = useState(null);

    if (isStillAuthenticated()) {
        getJson("/users/me").then(resp => setLoggedInAs(resp.data.id))
    }

    let unprotectedRoutes = [
        "/login"
    ];

    /**
     * @var pathIsProtected Checks if path exists in the unprotectedRoutes routes array
     */
    let pathIsProtected = unprotectedRoutes.indexOf(router.pathname) === -1;

    if (isBrowser() && !loggedInAs && pathIsProtected) {
        router.push("/login");
    }

    return children;
};

export default ProtectedRoute;