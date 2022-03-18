import React, {useState} from "react";
import {useLocation, useNavigate} from 'react-router-dom'
import {login} from "../utils/json-requests";
import {log} from "../utils/logger";
import "../styles/colors.css"
import "../styles/login.css"



const Login = props => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showForgot, setShowForgot] = useState(false)
    const [emailForgot, setEmailForgot] = useState("")
    let from =  useLocation().state?.from?.pathname || "/";
    const navigate = useNavigate()

    const handleChangeEmail = (event) => {
        setEmail(event.target.value);
    }

    const handleChangePassword = (event) => {
        setPassword(event.target.value);
    }

    const handleChangeEmailForgot = (event) => {
        setEmailForgot(event.target.value);
    }


    async function handleSubmitLogin(event) {
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
            // navigate to original path or '/'
            navigate(from, { replace: true });
        }
    }

    async function handleSubmitForgot(event) {
        log("handle forgot submit")
        event.preventDefault();
        let credentials = JSON.stringify({
            "email": email,
        });
        log(credentials)
        // post, if any errors, show them
        let output = await login("/forgot", credentials);
        console.log(output)
        if (output.success) {
        }
        setShowForgot(false)
    }

    return (
        <div className="body">
            <section className="body-left">
                <img src={process.env.PUBLIC_URL + "/assets/0-1-osoc-full-2.png"} alt="osoc-logo"/>
            </section>

            <section className="body-right">
                <div className="login-container">
                    <p className="welcome-message">Please provide login credentials to proceed</p>
                    <div className="login-form">
                        <form onSubmit={handleSubmitLogin}>
                            <input type="email" name="email" value={email} onChange={handleChangeEmail} placeholder="Email address"/>
                            <input type="password" name="password" value={password} onChange={handleChangePassword} placeholder="Password"/>
                            <input className="submit" type="submit" name="submit" value="Login"/>
                        </form>
                    </div>
                    {(!showForgot)? (
                        <button className="submit" onClick={() => {setEmailForgot(email); setShowForgot(true);}} >Forgot your password?</button>
                        ):
                        (
                        <div>
                            <p className="welcome-message">Please provide your email address to proceed</p>
                            <form onSubmit={handleSubmitForgot}>
                                <input type="email" name="email" value={emailForgot} onChange={handleChangeEmailForgot} placeholder="Email address"/>
                                <input className="submit" type="submit" name="submit" value="Reset my password"/>
                            </form>
                        </div>
                        )}
                </div>
            </section>
        </div>
    )
}



export default Login