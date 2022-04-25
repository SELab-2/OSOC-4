import {Card} from "react-bootstrap";

import React from "react";


/**
 * This component displays a message
 * @param props
 * @returns {JSX.Element}
 */
export default function Message(props) {


    return (
        <Card style={{ width: '40rem', borderRadius: "0.5em", margin: "15pt"}}>
            <Card.Body>
                <Card.Title>{props.title}</Card.Title>
                <Card.Subtitle className="mb-2 text-muted">{props.subtitle}</Card.Subtitle>
                <Card.Text>
                    {props.children}
                </Card.Text>
            </Card.Body>
        </Card>
    );
};