import React, { useEffect, useState } from "react";
import ManageUsers from "../Components/settings/ManageUsers";
import ChangePassword from "../Components/settings/ChangePassword";
import EditionDropdownButton from "../Components/settings/EditionDropdownButton";
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
import edition from "/public/assets/edition.png"
import QuestionTags from "../Components/settings/QuestionTags";
import LoadingPage from "../Components/LoadingPage";

/**
 * The page corresponding with the 'settings' tab.
 * @returns {JSX.Element} A component corresponding with the 'settings' tab.
 */
export default function Settings(props) {
    const [user, setUser] = useState(undefined);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [role, setRole] = useState(0);
    const [currentVersion, setCurrentVersion] = useState(undefined)
    const [loading, setLoading] = useState(false)
    const [initializeUsers, setInitializeUsers] = useState("");
    //TODO save settings of user and load this from backend or from browser settings
    const [darkTheme, setDarkTheme] = useState(false);


    // fetch the current user & current edition
    useEffect(() => {
        async function fetch() {
            if ((user === undefined || name === "" || email === "") && !loading) {
                setLoading(true)
                let res = await Url.fromName(api.me).get();
                if (res.success) {
                    res = res.data.data;
                    setUser(res);
                    setName(res.name);
                    setEmail(res.email);
                    setRole(res.role);
                }
                res = await Url.fromName(api.current_edition).get();
                if (res.success) {
                    console.log("BOE");
                    console.log(res.data);
                    setCurrentVersion(res.data);
                }
                setLoading(false);
            }
        }
        fetch();
    }, [loading, user, name, email]);

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
                    <Accordion.Header>
                        <h3>Personal settings</h3>
                    </Accordion.Header>
                    <AccordionBody>
                        <div className="personal-settings">
                            <SettingCards image={change_password_image} title={"Change password"} subtitle={"Having a strong password is a good idea"}>
                                <ChangePassword />
                            </SettingCards>
                            <SettingCards image={change_email_image} title={"Change email"} subtitle={"Change to a different email-adress"}>
                                <ChangeEmail email={email} />
                            </SettingCards>
                            <SettingCards image={change_name_image} title={"Change name"} subtitle={"This name will be displayed throughout the website"}>
                                <ChangeName user={user} />
                            </SettingCards>
                        </div>
                    </AccordionBody>
                </AccordionItem>

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
                </AccordionItem>

                {(role === 2) ? (
                    <AccordionItem eventKey="2">
                        <AccordionHeader>
                            <h3>Select edition</h3>
                        </AccordionHeader>
                        <AccordionBody>
                            <div className="edition-settings">
                                <SettingCards image={edition} title={currentVersion.name} subtitle={"Select another edition (applies to the whole website)"}>
                                    <EditionDropdownButton currentVersion={currentVersion} setCurrentVersion={setCurrentVersion} />
                                </SettingCards>
                            </div>
                        </AccordionBody>
                    </AccordionItem>) : null }

                {(role === 2) ? (
                    <AccordionItem eventKey="3" onClick={() => setInitializeUsers(true)}>
                        <AccordionHeader>
                            <h3>Manage users</h3>
                        </AccordionHeader>
                        <AccordionBody>
                            <div className="manage-users-settings">
                                <ManageUsers me={user} initialize={initializeUsers} />
                            </div>
                        </AccordionBody>
                    </AccordionItem>) : null}


                <AccordionItem eventKey="4">
                    <AccordionHeader>
                        <h3>Question Tags</h3>
                    </AccordionHeader>
                    <AccordionBody>
                        <div className="question-tags-settings">
                            <QuestionTags />
                        </div>
                    </AccordionBody>
                </AccordionItem>

            </Accordion>



        </div>

    )
}