import Image from 'next/image'
import { useState } from 'react';
import { useRouter } from 'next/router'
import { signIn } from 'next-auth/react';
import logoScreen from '../public/assets/osoc-screen.png';
import LoadingPage from "../Components/LoadingPage";
import {api, Url} from "../utils/ApiClient";
import { Form, Button, Spinner} from 'react-bootstrap';
import { toast, ToastContainer } from 'react-toastify';

/**
 * The login page.
 * @returns {JSX.Element} The component that renders the login page.
 * @constructor
 */
export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showForgot, setShowForgot] = useState(false)
    const [emailForgot, setEmailForgot] = useState("")
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [saving, setSaving] = useState(false);
    const router = useRouter();

    /**
     * called when the email field is changed, it changes the email state variable according to the value of
     * the email field.
     * @param event the event of changing the email field.
     */
    const handleChangeEmail = (event) => {
        setEmail(event.target.value);
    }

    /**
     * called when the password field is changed, it changes the password state variable according to the value of
     * the password field.
     * @param event the event of changing the password field.
     */
    const handleChangePassword = (event) => {
        setPassword(event.target.value);
    }

    /**
     * called when the emailForgot field is changed, it changes the emailForgot state variable according to the value of
     * the emailForgot field.
     * @param event the event of changing the emailForgot field.
     */
    const handleChangeEmailForgot = (event) => {
        event.preventDefault();
        setEmailForgot(event.target.value);
    }

    /**
     * Called when the login button is pushed. It will try to log in with the current login credentials.
     * @returns {Promise<void>}
     */
    async function handleLogin() {
        await setLoading(true);
        await signIn('credentials', {redirect: false, email: email, password: password });
        await setMessage("Login failed, please provide the correct email address and password.")
        await setLoading(false);
    }


    /**
     * Called when the 'reset password' button is pushed.
     * @param event the event of pushing the 'reset password' button.
     * @returns {Promise<void>}
     */
    async function handleSubmitForgot(event) {
        event.preventDefault();
        setSaving(true);
        let credentials = JSON.stringify({
            "email": emailForgot,
        });
        const resp = await Url.fromName(api.forgot).setBody(credentials).post().then()
        if (resp.success) {
            setSaving(false);
            toast.success("Email to reset password sent succesfully. Please check your inbox");
            setEmailForgot("");
            await setTimeout(function(){
                setShowForgot(false);
            }, 4000);
        } else {
            setSaving(false);
            toast.error("Something went wrong, please try again");
            setEmailForgot("");
        }
    }

    /**
     * If the page is loading, show the loading animation.
     */
    if (loading) {
        return (<LoadingPage/>);
    }

    /**
     * Return the html for the login page.
     */
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
                            <Form onSubmit={handleLogin}>
                                <Form.Control type="email" name="email" value={email} onChange={handleChangeEmail} placeholder="Email address" />
                                <Form.Control type="password" name="password" value={password} onChange={handleChangePassword} placeholder="Password" />
                                <Button className="submit" type="submit">Log in</Button>
                            </Form>
                        </div>
                        <p>{message}</p>
                        <br/>
                        <a href="#" onClick={() => { setEmailForgot(email); setShowForgot(true); }} >Forgot your password?</a>
                    </div>
                ) : (
                    <div className="login-container">
                        <p className="welcome-message">Please provide your email address to proceed</p>
                        <Form onSubmit={handleSubmitForgot}>
                            <Form.Control type="email" name="email" value={emailForgot} onChange={handleChangeEmailForgot} placeholder="Email address" />
                            {saving ? 
                                <Button type="submit" className="submit" disabled>
                                Sending reset email...
                                <Spinner
                                    as="span"
                                    animation="border"
                                    size="sm"
                                    role="status"
                                    aria-hidden="true"
                                />
                                </Button> 
                            : <Button className="submit" type="submit">Reset my password</Button>}
                        </Form>
                        <a href="#" onClick={() => { setShowForgot(false); }} >Just want to log in?</a>
                    </div>
                )}
            </section>
            <ToastContainer autoClose={4000}/>
        </div>
    )
}