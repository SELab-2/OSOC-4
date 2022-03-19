import React, {useEffect, useState} from "react";
import {log} from "../utils/logger";
import {getJson, postCreate} from "../utils/json-requests";
import "../styles/settings.css"

export default function Settings(props) {
    const [user, setUser] = useState(undefined);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [role, setRole] = useState(0);
    const [savedSuccess, setSavedSuccess] = useState(false);

    useEffect(() => {
        if (!user) {getJson(props.loggedInAs).then(res => {
            setUser(res.data);
            setName(res.data.name);
            setEmail(res.data.email);
            setRole(res.data.role);
        })}
    });

    const handleChangeName = (event) => {
        event.preventDefault()
        setName(event.target.value);
    }

    const handleChangeEmail = (event) => {
        event.preventDefault()
        setName(event.target.value);
    }

    async function handleSubmitChange(event) {
        log("handle submit change name");
        event.preventDefault()
        let body = JSON.stringify({
            "email": user.email,
            "name": name
        })
        //setSavedSuccess(true)
        let response = await postCreate(props.loggedInAs, body)
        if (response.success) {setSavedSuccess(true);}
    }

    return(
        <div className="body-settings">
        <h2>Settings</h2>
            <div className="personal-settings">
            <h5>Personal information</h5>
                <form onSubmit={handleSubmitChange}>
                    <input type="text" name="name" value={name} onChange={handleChangeName} />
                    <input type="email" name="email" value={email} onChange={handleChangeEmail} />
                    <input className="submit" type="submit" name="submit" value="Save"/>
                    {(savedSuccess)? (<label>saved!</label>) : null}
                </form>
            </div>
            {(role === 2)? (
                <div className="admin-settings">
                    admin-settings
                </div>

            ) : null}
        </div>

    )
}