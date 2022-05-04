import {Form} from "react-bootstrap";
import React from "react";

/**
 * Div which can switch between an editable field and a normal field
 * @param props
 * @returns {JSX.Element}
 * @constructor
 */
export default function EditableDiv(props){

    return(
        <div>
            {props.showEdit ?
                props.isTextArea ?
                        <Form.Control as="textarea" className={props.cssClass + "-edit"} value={props.changeValue} onChange={e => props.setChangeValue(e.target.value)} rows={3} />
                        :
                        <Form.Control type="text" className={props.cssClass + "-edit"} value={props.changeValue} onChange={e => props.setChangeValue(e.target.value)} />
                :
                <div className={props.cssClass}>{props.value}</div>
            }
        </div>
    )
}