import React, {useEffect, useState} from "react";
import ManageUsers from "../Components/settings/ManageUsers";
import ChangePassword from "../Components/settings/ChangePassword";
import ChangeName from "../Components/settings/ChangeName";
import ChangeEmail from "../Components/settings/ChangeEmail";
import SettingCards from "../Components/settings/SettingCards";
import { Accordion } from "react-bootstrap";
import AccordionItem from "react-bootstrap/AccordionItem";
import AccordionBody from "react-bootstrap/AccordionBody";
import AccordionHeader from "react-bootstrap/AccordionHeader";
import {api, Url} from "../utils/ApiClient";
import ChangeTheme from "../Components/settings/ChangeTheme";
import change_email_image from "/public/assets/change_email.png"
import change_name_image from "/public/assets/change_name.png"
import change_password_image from "/public/assets/change_password.png"
import dark_theme from "/public/assets/dark_theme.png"
import EditionSettings from "../Components/settings/EditionSettings";
import LoadingPage from "../Components/LoadingPage";


/**
 * The page corresponding with the 'settings' tab.
 * @returns {JSX.Element} A component corresponding with the 'settings' tab.
 */
function Settings() {
    const [initializeUsers, setInitializeUsers] = useState("");
    //TODO save settings of user and load this from backend or from browser settings
    const [darkTheme, setDarkTheme] = useState(false);
    const [me, setMe] = useState(undefined);
    const [loading, setLoading] = useState(true)


    useEffect(() => {
            Url.fromName(api.me).get().then(res => {
                if (res.success) {
                    setMe(res.data.data);
                    setLoading(false);
                }
            });
    }, [])

    //TODO make this actually change the theme
    /**
     * Changes the theme of the website
     * @param event
     */
    const changeTheme = (event) => {
        event.preventDefault()
        setDarkTheme(!darkTheme)
    }

    if (loading) {
        return (<LoadingPage/>);
    }

    return (
        <div className="body-settings">
            <Accordion defaultActiveKey="0">

                <AccordionItem eventKey="0">
                    <AccordionHeader>
                        <h3>Personal settings</h3>
                    </AccordionHeader>
                    <AccordionBody>
                        <div className="personal-settings">
                            <SettingCards image={change_name_image} title={"Change name"} subtitle={"This name will be displayed throughout the website"}>
                                <ChangeName user={me} />
                            </SettingCards>
                            <SettingCards image={change_email_image} title={"Change email"} subtitle={"Change to a different email-adress"}>
                                <ChangeEmail user={me} />
                            </SettingCards>
                            <SettingCards image={change_password_image} title={"Change password"} subtitle={"Having a strong password is a good idea"}>
                                <ChangePassword />
                            </SettingCards>
                        </div>
                    </AccordionBody>
                </AccordionItem>

                {(process.env.NODE_ENV === "production")? null :  // THIS ISN'T READY YET, HIDE IN PRODUCTION
                <AccordionItem eventKey="1">
                    <AccordionHeader>
                        <h3>Website settings</h3>
                    </AccordionHeader>
                    <AccordionBody>
                        <div className="website-settings">
                            <SettingCards image={dark_theme} title={"Dark theme"} subtitle={"Customize the layout of the website to reduce the glow and calm your eyes"}>
                                <ChangeTheme />
                            </SettingCards>
                        </div>
                    </AccordionBody>
                </AccordionItem>}

                {(me.role === 2) ? (
                    <AccordionItem eventKey="2">
                        <AccordionHeader>
                            <h3>Edition settings</h3>
                        </AccordionHeader>
                        <AccordionBody>
                            <EditionSettings/>
                        </AccordionBody>
                    </AccordionItem>) : null}
                {(me.role === 2) ? (
                    <AccordionItem eventKey="4" onClick={() => setInitializeUsers(true)}>
                        <AccordionHeader>
                            <h3>Manage users</h3>
                        </AccordionHeader>
                        <AccordionBody>
                            <div className="manage-users-settings">
                                <ManageUsers me={me} initialize={initializeUsers} />
                            </div>
                        </AccordionBody>
                    </AccordionItem>) : null}


            </Accordion>

        </div>

    );
}

export default Settings