import { useRouter } from 'next/router'
import React, { useEffect } from 'react'
import { useState } from 'react';
import LoadingPage from "../../Components/LoadingPage"
import { api, Url } from "../../utils/ApiClient";
import logoScreen from '../../public/assets/osoc-screen.png';
import Image from 'next/image'
import { ToastContainer, toast } from 'react-toastify';

/**
 * The page to reset your password.
 * @returns {JSX.Element} the page tho reset your password.
 * @constructor
 */
const Reset = () => {
    const router = useRouter()
    const { resetkey } = router.query
    const [validKey, setValidkey] = useState(false);
    const [loading, setLoading] = useState(true);

    const [password, setPassword] = useState("");
    const [validatePassword, setValidatePassword] = useState("");

    /**
     * Handle the change of the password field. It changes the state variable password.
     * @param event The event of changing the password field.
     */
    const handleChangePassword = (event) => {
        setPassword(event.target.value);
    }

    /**
     * Handle the change of the validation password field. It changes the state variable validatePassword.
     * @param event The event of changing the validatePassword field.
     */
    const handleChangeValidationPassword = (event) => {
        setValidatePassword(event.target.value);
    }

    /**
     * Called when pushing the submit button. It posts the new password to the database if the password is valid and
     * password and validatePassword are the same.
     * @param event The event of pushing the submit button.
     * @returns {Promise<void>}
     */
    const handleSubmit = async (event) => {
        event.preventDefault();
        if (password <= 11) { toast.error("The new password is to short, it should be at least 12 characters long"); return; }
        if (password !== validatePassword) { toast.error("The two passwords don't match."); return; }

        const data = {
            "password": password,
            "validate_password": validatePassword
        }
        const resp = await Url.fromName(api.resetpassword).extend(`/${resetkey}`).setBody(data).post();

        if (resp.success) {
            toast.success(resp.data["message"]);
            await router.push('/login');
        }
    }

    /**
     * This useEffect sets the validKey variable on change of the resetKey state variable.
     */
    useEffect(() => {
        Url.fromName(api.resetpassword).extend(`/${resetkey}`).get().then(resp => {
            if (resp.success) { setValidkey(true); }
            setLoading(false);
        });
    }, [resetkey])

    /**
     * If the page is loading, show the loading animation.
     * If there is not valid key, show a message.
     */
    if (loading) {
        return <LoadingPage />
    }
    else if (!validKey) {
        return <h1>Not a valid password reset key</h1>
    }

    /**
     * Return the html of the reset password page.
     */
    return (
        <div className='body-login'>
            <section className="body-left">
                <div className="image-wrapper">
                    <Image className="logo" src={logoScreen} alt="osoc-logo" />
                </div>
            </section>
            <section className='body-right'>
                <div className="login-container">
                    <p className="welcome-message">Reset your password</p>
                    <div className="login-form">
                        <input type="password" name="password" value={password} onChange={handleChangePassword} placeholder="Password" />
                        {(password.length > 11) ? <p className='text-right'>Password is at least 12 characters long</p> : (<p className='text-wrong'>Password should be at least 12 characters long!</p>)}
                        <input type="password" name="validatePassword" value={validatePassword} onChange={handleChangeValidationPassword} placeholder="Confirm password" />
                        {(password !== "" && password === validatePassword) ? <p className='text-right'>Password are the same</p> : (<p className='text-wrong'>Passwords should be the same!</p>)}
                        <button className="submit" onClick={handleSubmit}>
                            Submit
                        </button>

                    </div>
                </div>
            </section>
            <ToastContainer />
        </div>


    )
}

export default Reset;