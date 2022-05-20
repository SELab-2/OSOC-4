import {Button} from "react-bootstrap";
import { Url } from "../../utils/ApiClient";

/**
 * This component displays a settings-screen to change a user's email.
 * @returns {JSX.Element}
 */
export default function ChangeEmail(props) {

    /**
     * This function makes a post request to the api to request a new email
     * @param event
     */
    async function requestNewEmail(event){
        event.preventDefault();
        let response = await Url.fromName(api.myself).extend("/change-email").post();
        if (response.success){
            alert("Gelukt!");
        } else {
            alert("Niet gelukt");
        }
    }

    return(
        <div>
            <p className="details-text">Request to change your accounts e-mailadres, first we will send a email to your current e-mailadres to confirm this.<br/>
                There you will get a link which will allow you to change your current accounts e-mailadres to the e-mailadres of your choosing.</p>
            <p>Current e-mail adress: <span className={"details-info"}>{props.user.email}</span> </p>
            <Button variant="primary" onClick={requestNewEmail}>Request new e-mailadres</Button>
        </div>
    )
}