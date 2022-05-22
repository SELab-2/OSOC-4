import {OverlayTrigger, Tooltip} from "react-bootstrap";
import React from "react";

/**
 * Component to render another component with a hint when hovering over the component.
 * @param props props contains message and children. message is the message that needs to be shown. children are the
 * components that need to be rendered as child components.
 * @returns {JSX.Element} Component to render another component with a hint when hovering over the component.
 * @constructor
 */
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
