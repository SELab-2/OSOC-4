import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'
import { useState } from 'react';
import { useRouter } from 'next/router'
import { login } from "../utils/json-requests";
import { log } from "../utils/logger";
import { signIn } from 'next-auth/react';

const Login = props => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showForgot, setShowForgot] = useState(false)
    const [emailForgot, setEmailForgot] = useState("")
    const router = useRouter()
    // let from = useLocation().state?.from?.pathname || "/";
    // const navigate = useNavigate()

    const handleChangeEmail = (event) => {
        setEmail(event.target.value);
    }

    const handleChangePassword = (event) => {
        setPassword(event.target.value);
    }

    const handleChangeEmailForgot = (event) => {
        event.preventDefault();
        setEmailForgot(event.target.value);
    }


    async function handleSubmitLogin(event) {
        log("handle login submit")

    }


    async function handleSubmitForgot(event) {
        log("handle forgot submit")
        event.preventDefault();
        let credentials = JSON.stringify({
            "email": emailForgot,
        });
        log(credentials)
        // post, if any errors, show them
        let output = await forgot(credentials);
        console.log(output)
        if (output.success) {
        }
        setShowForgot(false)
    }

    return (
        <div className="body-login">
            <section className="body-left">
                <div className="image-wrapper">
                    <Image src="/assets/0-1-osoc-full-2.png" alt="osoc-logo" width="100%" height="100%" layout={'responsive'} objectFit={'contain'} />
                </div>
            </section>

            <section className="body-right">
                {(!showForgot) ? (
                    <div className="login-container">
                        <p className="welcome-message">Please provide login credentials to proceed</p>
                        <div className="login-form">

                            <input type="email" name="email" value={email} onChange={handleChangeEmail} placeholder="Email address" />
                            <input type="password" name="password" value={password} onChange={handleChangePassword} placeholder="Password" />

                            <button className="submit" onClick={() => { signIn('credentials', { email: email, password: password }) }}>
                                Login
                            </button>

                        </div>
                        <a href="#" onClick={() => { setEmailForgot(email); setShowForgot(true); }} >Forgot your password?</a>
                    </div>
                ) : (
                    <div className="login-container">
                        <p className="welcome-message">Please provide your email address to proceed</p>
                        <form onSubmit={handleSubmitForgot}>
                            <input type="email" name="email" value={emailForgot} onChange={handleChangeEmailForgot} placeholder="Email address" />
                            <input className="submit" type="submit" name="submit" value="Reset my password" />
                        </form>
                        <a href="#" onClick={() => { setShowForgot(false); }} >Just want to log in?</a>
                    </div>
                )}
            </section>
        </div>
    )
}



export default Login