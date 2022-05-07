import {OverlayTrigger, Tooltip} from "react-bootstrap";
import React from "react";


export default function Hint(props) {

    return (
        <OverlayTrigger
            key={props.message}
            placement="top"
            overlay={(<Tooltip>{props.message}</Tooltip>)} >
            <button className="image-button">
                {props.children}
            </button>
        </OverlayTrigger>
    );

}
