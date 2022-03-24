import {Button} from "react-bootstrap";
import "../styles/settingcards.css"

export default function ChangeEmail(props) {

    const requestNewEmail = event => {
        event.preventDefault();
        //TODO make this work with backend
    }

    return(
        <div>
            <p className="details-text">Request to change your accounts e-mailadres, first we will send a email to your current e-mailadres to confirm this.<br/>
                There you will get a link which will allow you to change your current accounts e-mailadres to the e-mailadres of your choosing.</p>
            <p>Current e-mail adress: <span className={"details-info"}>{props.email}</span> </p>
            <Button variant="outline-secondary" onClick={requestNewEmail}>Request new e-mailadres</Button>
        </div>
    )
}
