import {Navigate, useLocation} from "react-router-dom";

export default function RequireAuthentication(props) {
    let location = useLocation();
    return(
        (props.isLoggedIn) ? props.children : <Navigate to="/login" state={{ from: location }} replace />
    )
}
