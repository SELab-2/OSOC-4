import {Button} from "react-bootstrap";

export default function ChangeEmail(props) {

    const requestNewEmail = event => {
        event.preventDefault();
        //TODO make this work with backend (not implemented yet)
    }
    return(
        <div>
            <span>Request to change your accounts e-mailadres, first we will send a email to your current e-mailadres to confirm this. There you will get a link which will allow you to change your current accounts e-mailadres to the e-mailadres of your choosing.</span>
            <Button variant="outline-secondary" onClick={requestNewEmail}>Request new e-mailadres</Button>
        </div>
    )
}
