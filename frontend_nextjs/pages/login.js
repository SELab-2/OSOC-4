import Image from 'next/image'
import { useState } from 'react';
import { useRouter } from 'next/router'
import { signIn } from 'next-auth/react';
import logoScreen from '../public/assets/osoc-screen.png';
import LoadingPage from "../Components/LoadingPage";
import {api, Url} from "../utils/ApiClient";

const Login = props => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showForgot, setShowForgot] = useState(false)
    const [emailForgot, setEmailForgot] = useState("")
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
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


    async function handleLogin() {
        await setLoading(true);
        await signIn('credentials', {redirect: false, email: email, password: password });
        await setMessage("Login failed, please provide the correct email address and password.")
        await setLoading(false);
    }


    async function handleSubmitForgot(event) {
        event.preventDefault();
        let credentials = JSON.stringify({
            "email": emailForgot,
        });
        // post, if any errors, show them
        let output = Url.fromName(api.forgot).setBody(credentials).post();
        if (output.success) {
        }
        setShowForgot(false)
    }

    if (loading) {
        return (<LoadingPage/>);
    }

    return (
        <div className="body-login">
            <section className="body-left">
                <div className="image-wrapper">
                    <Image className="logo" src={logoScreen} alt="osoc-logo" />
                </div>
            </section>

            <section className="body-right">
                {(!showForgot) ? (
                    <div className="login-container">
                        <p className="welcome-message">Please provide login credentials to proceed</p>
                        <div className="login-form">

                            <input type="email" name="email" value={email} onChange={handleChangeEmail} placeholder="Email address" />
                            <input type="password" name="password" value={password} onChange={handleChangePassword} placeholder="Password" />

                            <button className="submit" onClick={handleLogin}>
                                Login
                            </button>

                        </div>

                        <p>{message}</p>
                        <br/>
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