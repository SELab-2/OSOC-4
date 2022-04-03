import React, {useEffect, useState} from "react";
import {getJson} from "../utils/json-requests";
import ManageUsers from "../Components/settings/ManageUsers";
import ChangePassword from "../Components/settings/ChangePassword";
import EditionDropdownButton from "../Components/settings/EditionDropdownButton";
import ChangeName from "../Components/settings/ChangeName";
import ChangeEmail from "../Components/settings/ChangeEmail";
import SettingCards from "../Components/settings/SettingCards";
import {Accordion, Button} from "react-bootstrap";
import AccordionItem from "react-bootstrap/AccordionItem";
import AccordionBody from "react-bootstrap/AccordionBody";
import AccordionHeader from "react-bootstrap/AccordionHeader";
import {useSession} from "next-auth/react";
import {log} from "../utils/logger";



export default function Settings(props) {
    const [user, setUser] = useState(undefined);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [role, setRole] = useState(0);

    //TODO save settings of user and load this from backend or from browser settings
    const [darkTheme, setDarkTheme] = useState(false);

    const { data: session, status } = useSession()

    useEffect(() => {
        log(session)
        if (session) {
            // TODO change to /users/me
            getJson(session.userid).then(res => {
                    setUser(res.data);
                    setName(res.data.name);
                    setEmail(res.data.email);
                    setRole(res.data.role);
                }
            )
        }
    }, [session]);

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
                                <ChangeName userid={session.userid} user={user}/>
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
                            {/*<EditionDropdownButton/>*/}
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