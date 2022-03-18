import React, {useState} from "react";
import {useNavigate} from 'react-router-dom'
import {login} from "../utils/json-requests";
import {log} from "../utils/logger";



const Login = props => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const navigate = useNavigate()

    const handleChangeEmail = (event) => {
        setEmail(event.target.value);
    }

    const handleChangePassword = (event) => {
        setPassword(event.target.value);
    }

    async function handleSubmit(event) {
        log("handle login submit")
        event.preventDefault();
        let credentials = JSON.stringify({
            "email": email,
            "password": password
        });
        log(credentials)
        // post, if any errors, show them
        let output = await login("/login", credentials);
        console.log(output)
        if (output.success) {
            props.setIsLoggedIn(true)
        }
    }

    return (
            <div className="body">
                <div className="login-container">
                    <p className="welcome-message">Please provide login credentials to proceed</p>
                    <div className="login-form">
                        <form onSubmit={handleSubmit}>
                            <input type="email" name="email" value={email} onChange={handleChangeEmail} placeholder="Email address"/>
                            <input type="password" name="password" value={password} onChange={handleChangePassword} placeholder="Password"/>
                            <input className="submit" type="submit" name="submit" value="Login"/>
                        </form>
                    </div>
                </div>
            </div>
        )
    }



export default Login