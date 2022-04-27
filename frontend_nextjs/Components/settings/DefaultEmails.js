import {Button, Col, Row} from "react-bootstrap";

import { useRouter } from "next/router";
import React, {useState} from "react";
import DefaultEmail from "../email-students/DefaultEmail";
import {getEmailStudentsPath} from "../../routes";


/**
 * The page which is used to change the default emails.
 * @returns {JSX.Element} An element that renders the 'change default emails' page.
 */
export default function DefaultEmails() {
    const router = useRouter();

    const [yesEmail, setYesEmail] = useState("default yes email");
    const [maybeEmail, setMaybeEmail] = useState("default maybe email");
    const [noEmail, setNoEmail] = useState("default no email");

    /**
     * This function is called when the save button is clicked, it saves the emails in the database and goes back to the
     * 'email students' page
     */
    function saveDefaultEmails() {
        router.push(getEmailStudentsPath());
    }

    /**
     * This function is called when the cancel button is clicked, it goes back to the 'email students' page without
     * saving the emails.
     */
    function cancel() {
        router.push(getEmailStudentsPath());
    }

    /**
     * The html that renders the 'change default emails' page
     */
    return (
        <Row className="fill_width">
            <Col>
                <Row className="emails-title-margin" md="auto">
                    <h2 className="nopadding" >Change default emails</h2>
                </Row>
                <DefaultEmail value="'Yes'" email={yesEmail} setEmail={setYesEmail} />
                <DefaultEmail value="'Maybe'" email={maybeEmail} setEmail={setMaybeEmail} />
                <DefaultEmail value="'No'" email={noEmail} setEmail={setNoEmail} />
                <Row>
                    <Col />
                    <Col md="auto" >
                        <Button className="btn-secondary send-emails-button cancel-button"
                                onClick={cancel}>Cancel</Button>
                    </Col>
                    <Col md="auto" className="change-emails-savebutton">
                        <Button className="send-emails-button save-button"
                                onClick={saveDefaultEmails}>Save</Button>
                    </Col>
                </Row>
            </Col>
        </Row>
    )

}