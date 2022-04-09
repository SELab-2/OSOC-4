import {Button, Form} from "react-bootstrap";
import React, {useState} from "react";
import {log} from "../../utils/logger";

export default function ChangeTheme(props) {
    const [theme, setTheme] = useState('Off')

    function handleClick(mode){
        setTheme(mode)
    }
    return(
        <div>
            <p className="details-text">Changing the theme can reduces the strain on your eyes. <br/>
                You can turn dark theme on, of or select the automatic option this will adapt the theme to your systems preferences.
            </p>
            <Form>
                <Form.Check checked={theme === "Off"} onChange={e => handleClick("Off")} label={'Off'} id={"Off"}/>
                <Form.Check checked={theme === "On"} onChange={e => handleClick("On")} label={'On'} id={"On"} />
                <Form.Check checked={theme === "Automatic"} onChange={e => handleClick("Automatic")} label={'Automatic'} id={"Automatic"} />
            </Form>
        </div>
    )
}


// <Button variant={"outline-secondary"} onClick={changeTheme}>{darkTheme ? "Turn to light theme" : "Turn to dark theme"}</Button>
