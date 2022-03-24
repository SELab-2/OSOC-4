import React, {useEffect, useState} from "react";
import {getJson, isStillAuthenticated} from "../utils/json-requests";
import ManageUsers from "./ManageUsers";
import ChangePassword from "./ChangePassword";
import EditionDropdownButton from "./EditionDropdownButton";
import ChangeName from "./ChangeName";
import ChangeEmail from "./ChangeEmail";
import SettingCards from "./SettingCards";
import {Accordion, Button} from "react-bootstrap";
import AccordionItem from "react-bootstrap/AccordionItem";
import AccordionBody from "react-bootstrap/AccordionBody";
import AccordionHeader from "react-bootstrap/AccordionHeader";
import "../styles/settings.css"



export default function Settings(props) {
    const [user, setUser] = useState(undefined);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [role, setRole] = useState(0);

    //TODO save settings of user and load this from backend or from browser settings
    const [darkTheme, setDarkTheme] = useState(false);
    useEffect(() => {
        if (!user) {getJson(props.loggedInAs).then(res => {
            if (isStillAuthenticated()) {
                setUser(res.data);
                setName(res.data.name);
                setEmail(res.data.email);
                setRole(res.data.role);
            }}
        )}
    });

    //TODO make this actually change the theme
    const changeTheme = (event) => {
        event.preventDefault()
        setDarkTheme(! darkTheme)
    }

    return(
        <div className="body-settings">
            <Accordion defaultActiveKey="0">
                <AccordionItem eventKey="0">
                    <Accordion.Header>
                        <h3>Personal settings</h3>
                    </Accordion.Header>
                    <AccordionBody>
                        <div className="personal-settings">
                            <SettingCards title={"Change password"} subtitle={"Having a strong password is a good idea"}>
                                <ChangePassword/>
                            </SettingCards>
                            <SettingCards title={"Change email"} subtitle={"Change to a different email-adress"}>
                                <ChangeEmail email={email}/>
                            </SettingCards>
                            <SettingCards title={"Change name"} subtitle={"This name will be displayed throughout the website"}>
                                <ChangeName name={name} loggedInAs={props.loggedInAs} email={email}/>
                            </SettingCards>
                        </div>
                    </AccordionBody>
                </AccordionItem>
                <AccordionItem eventKey="1">
                    <AccordionHeader>
                        <h3>Website settings</h3>
                    </AccordionHeader>
                    <AccordionBody>
                        <div>
                            <Button variant={"outline-secondary"} onClick={changeTheme}>{darkTheme ? "Turn to light theme" : "Turn to dark theme"}</Button>
                            <EditionDropdownButton/>
                        </div>
                    </AccordionBody>
                </AccordionItem>
                {(role === 2)? (
                    <AccordionItem eventKey={2}>
                        <AccordionHeader>
                            <h3>Admin settings</h3>
                        </AccordionHeader>
                        <AccordionBody>
                            <div className="admin-settings">
                                <ManageUsers/>
                            </div>
                        </AccordionBody>
                    </AccordionItem>
                ) : null}
            </Accordion>



        </div>

    )
}

