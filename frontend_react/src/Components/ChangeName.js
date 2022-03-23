import React, {useState} from "react";
import {postCreate} from "../utils/json-requests";
import {log} from "../utils/logger";

export default function ChangeName(props) {

    const [savedSuccess, setSavedSuccess] = useState(false)

    const handleChangeName = (event) => {
        event.preventDefault()
        props.name = event.target.value
    }

    async function handleSubmitChange(event) {
        log("handle submit change name");
        event.preventDefault()
        let body = JSON.stringify({
            "email": props.email,
            "name": props.name
        })
        //setSavedSuccess(true)
        let response = await postCreate(props.loggedInAs, body)
        if (response.success) {setSavedSuccess(true);}
    }

    return (
            <div>
                <p>Your name will be displayed throughout the website when referencing you.</p>
                <form onSubmit={handleSubmitChange}>
                    <div>
                        <input type="text" name="name" value={props.name} onChange={handleChangeName} />
                    </div>
                    {savedSuccess ? (<p>changed name successfully</p>): null}
                    <input className="submit" type="submit" name="submitName" value="Save"/>
                </form>
            </div>
    )
}
