import { Col, Row } from "react-bootstrap";

import React from "react";
import DefaultEmail from "../email-students/DefaultEmail";


/**
 * The page which is used to change the default emails.
 * @returns {JSX.Element} An element that renders the 'change default emails' page.
 */
export default function DefaultEmails() {
    /**
     * The html that renders the 'change default emails' page
     */
    return (
        <Row className="fill_width">
            <Col>
                <DefaultEmail templatename="YES_DECISION" value="'Yes'" />
                <DefaultEmail templatename="MAYBE_DECISION" value="'Maybe'" />
                <DefaultEmail templatename="NO_DECISION" value="'No'" />
                <DefaultEmail templatename="UNDECIDED" value="'Undecided'" />
            </Col>
        </Row>
    )

}