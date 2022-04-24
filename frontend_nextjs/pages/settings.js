import React, { useState } from "react";
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
import QuestionTags from "../Components/settings/QuestionTags";
import EditionDropdownButton from "../Components/settings/EditionDropdownButton";
import CreateEdition from "../Components/settings/CreateEdition";

/**
 * The page corresponding with the 'settings' tab.
 * @returns {JSX.Element} A component corresponding with the 'settings' tab.
 */
function Settings({ me, current_edition }) {
    const [edition, setEdition] = useState(current_edition)
    const [initializeUsers, setInitializeUsers] = useState("");
    //TODO save settings of user and load this from backend or from browser settings
    const [darkTheme, setDarkTheme] = useState(false);



    //TODO make this actually change the theme
    /**
     * Changes the theme of the website
     * @param event
     */
    const changeTheme = (event) => {
        event.preventDefault()
        setDarkTheme(!darkTheme)
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
                            <SettingCards image={change_password_image} title={"Change password"} subtitle={"Having a strong password is a good idea"}>
                                <ChangePassword />
                            </SettingCards>
                            <SettingCards image={change_email_image} title={"Change email"} subtitle={"Change to a different email-adress"}>
                                <ChangeEmail user={me} />
                            </SettingCards>
                            <SettingCards image={change_name_image} title={"Change name"} subtitle={"This name will be displayed throughout the website"}>
                                <ChangeName user={me} />
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

                {(me.role === 2) ? (
                    <AccordionItem eventKey="2">
                        <AccordionHeader>
                            <h3>Edition settings</h3>
                        </AccordionHeader>
                        <AccordionBody>
                            <div className="body-editiondetail">
                                <h1>{edition.name}</h1>
                                <p>{(edition.description) ? edition.description : "No description available"}</p>
                                <Accordion>
                                    <AccordionItem eventKey="0">
                                        <AccordionHeader>
                                            <h3>Change edition</h3>
                                        </AccordionHeader>
                                        <AccordionBody>
                                            <EditionDropdownButton currentVersion={edition} setCurrentVersion={setEdition} />
                                        </AccordionBody>
                                    </AccordionItem>
                                    <AccordionItem eventKey="1">
                                        <AccordionHeader>
                                            <h3>Question Tags</h3>
                                        </AccordionHeader>
                                        <AccordionBody>
                                            <div className="questiontags">
                                                <QuestionTags />
                                            </div>
                                        </AccordionBody>
                                    </AccordionItem>
                                    <AccordionItem eventKey="2">
                                        <AccordionHeader>
                                            <h3>Create new edition</h3>
                                        </AccordionHeader>
                                        <AccordionBody>
                                            <CreateEdition/>
                                        </AccordionBody>
                                    </AccordionItem>

                                </Accordion>
                            </div>
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

    )
}


export async function getServerSideProps(context) {
    let props_out = {}
    let me = await Url.fromName(api.me).get(context);
    if (me.success) {
        props_out["me"] = me.data.data;
    }

    let edition = await Url.fromName(api.current_edition).get(context);
    if (edition.success) {
        props_out["current_edition"] = edition.data;
    }

    return {
        props: props_out
    }
}

export default Settings