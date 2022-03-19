import {Navigate, useLocation} from "react-router-dom";

export default function RequireAuthentication(props) {
    let location = useLocation();
    return(
        (props.loggedInAs) ? props.children : <Navigate to="/login" state={{ from: location }} replace />
    )
}
