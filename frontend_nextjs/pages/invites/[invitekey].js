import { useRouter } from 'next/router'
import React, { useEffect } from 'react'
import { useState } from 'react';
import LoadingPage from "../../Components/LoadingPage"
import {api, Url} from "../../utils/ApiClient";
import logoScreen from '../../public/assets/osoc-screen.png';
import Image from 'next/image'

const Invite = () => {
    const router = useRouter()
    const { invitekey } = router.query
    const [validKey, setValidkey] = useState(false);
    const [loading, setLoading] = useState(true);

    const [name, setName] = useState("");
    const [password, setPassword] = useState("");
    const [validatePassword, setValidatePassword] = useState("");

    const handleChangePassword = (event) => {
        setPassword(event.target.value);
    }

    const handleChangeValidationPassword = (event) => {
        setValidatePassword(event.target.value);
    }

    const handleChangeName = (event) => {
        setName(event.target.value);
    }

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (password <= 11) {alert("The new password is to short, it should be at least 12 characters long");return;}
        if (password !== validatePassword) {alert("The two passwords don't match.");return;}

        const j = {
            "validate_password": validatePassword,
            "password": password,
            "name": name,
        }
        const resp = await Url.fromName(api.invite).extend(`/${invitekey}`).setBody(j).post();
        if (resp.success) {
            await router.push('/login');
            alert("You must now wait until an admin allows you to access the application");
        }
    }

    useEffect(async () => {
        const resp = await Url.fromName(api.invite).extend(`/${invitekey}`).get();

        if (resp.success) {
            setValidkey(true);
        }
        setLoading(false);
    }, [invitekey])

    if (loading) {
        return <LoadingPage />
    }
    else if (!validKey) {
        return <h1>Not a valid invite</h1>
    }

    return (
        <div className='body-login'>
            <section className="body-left">
                <div className="image-wrapper">
                    <Image className="logo" src={logoScreen} alt="osoc-logo" />
                </div>
            </section>
            <section className='body-right'>
                <div className="login-container">
                    <p className="welcome-message">Please provide credentials to activate your account</p>
                    <div className="login-form">
                            <input type="name" name="name" value={name} onChange={handleChangeName} placeholder="Your name" />
                            <input type="password" name="password" value={password} onChange={handleChangePassword} placeholder="Password" />
                            {(password.length > 11) ? <p className='text-right'>Password is at least 12 characters long</p>: (<p className='text-wrong'>Password should be at least 12 characters long!</p>)}
                            <input type="password" name="validatePassword" value={validatePassword} onChange={handleChangeValidationPassword} placeholder="Confirm password" />
                            {(password !== "" && password === validatePassword) ? <p className='text-right'>Password are the same</p> : (<p className='text-wrong'>Passwords should be the same!</p>)}
                            <button className="submit" onClick={handleSubmit}>
                                Submit
                            </button>

                    </div>
                </div>
            </section>
        </div>

    )
}

export default Invite;