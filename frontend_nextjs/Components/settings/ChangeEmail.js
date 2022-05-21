import {Button, Spinner} from "react-bootstrap";
import { toast, ToastContainer } from "react-toastify";
import { Url } from "../../utils/ApiClient";
import { api } from "../../utils/ApiClient";
import { signOut } from 'next-auth/react';
import { useState } from "react";

/**
 * This component displays a settings-screen to change a user's email.
 * @returns {JSX.Element}
 */
export default function ChangeEmail(props) {

    const [saving, setSaving] = useState(false);

    /**
     * This function makes a post request to the api to request a new email
     * @param event
     */
    async function requestNewEmail(event){
        event.preventDefault();
        setSaving(true);
        let response = await Url.fromName(api.myself).extend("/change-email").post();
        if (response.success){
            setSaving(false);
            toast.success("Request sent succesfully. You will be logged out");
            await setTimeout(function(){
                signOut();
            }, 4000);
        } else {
            toast.error("Something went wrong, please try again");
            setSaving(false);
        }
    }

    /**
     * The html that renders the ChangeEmail component.
     */
    return(
        <div>
            <p className="details-text">Request to change your accounts e-mailadres, first we will send a email to your current e-mailaddress to confirm this.<br/>
                There you will get a link which will allow you to change your current accounts e-mailadres to the e-mailadres of your choosing.
                <br/><b>You will be automatically logged out after requesting the email to change your e-mailaddress!</b></p>
            <p>Current e-mail adress: <span className={"details-info"}>{props.user.email}</span> </p>
            {saving ?
            <Button variant="primary" disabled>
            Requesting new emailaddress...
            <Spinner
                as="span"
                animation="border"
                size="sm"
                role="status"
                aria-hidden="true"
            />
            </Button>
            :
            <Button variant="primary" onClick={requestNewEmail}>Request new e-mailaddress</Button>}
            <ToastContainer autoClose={4000}/>
        </div>
    )
}