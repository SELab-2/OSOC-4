import { useRouter } from 'next/router'
import React, { useEffect } from 'react'
import { useState } from 'react';
import LoadingPage from "../../Components/LoadingPage"
import { api, Url } from "../../utils/ApiClient";
import logoScreen from '../../public/assets/osoc-screen.png';
import Image from 'next/image'
import { ToastContainer, toast } from 'react-toastify';
import { Form, Button, Spinner } from 'react-bootstrap';

const Reset = () => {
    const router = useRouter()
    const { resetkey } = router.query
    const [validKey, setValidkey] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [password, setPassword] = useState("");
    const [validatePassword, setValidatePassword] = useState("");

    const handleChangePassword = (event) => {
        event.preventDefault();
        setPassword(event.target.value);
    }

    const handleChangeValidationPassword = (event) => {
        event.preventDefault();
        setValidatePassword(event.target.value);
    }

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (password <= 11) { toast.error("The new password is to short, it should be at least 12 characters long"); return; }
        if (password !== validatePassword) { toast.error("The two passwords don't match."); return; }
        setSaving(true);
        const data = {
            "password": password,
            "validate_password": validatePassword
        }
        const resp = await Url.fromName(api.resetpassword).extend(`/${resetkey}`).setBody(data).post();

        if (resp.success) {
            setSaving(false);
            toast.success(resp.data["message"]);
            setPassword("");
            setValidatePassword("");
            await setTimeout(function(){
                router.push('/login');
            }, 4000);
        } else {
            setSaving(false);
            toast.error("Something went wrong, please try again");
            setPassword("");
            setValidatePassword("");
        }
    }

    useEffect(() => {
        Url.fromName(api.resetpassword).extend(`/${resetkey}`).get().then(resp => {
            if (resp.success) { setValidkey(true); }
            setLoading(false);
        });
    }, [resetkey])

    if (loading) {
        return <LoadingPage />
    }
    else if (!validKey) {
        return <h1>Not a valid password reset key</h1>
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
                    <p className="welcome-message">Reset your password</p>
                    <div className="login-container">
                        <Form onSubmit={handleSubmit}>
                            <Form.Group>
                                <Form.Label>New password</Form.Label>
                                <Form.Control type="password" name="password" value={password} onChange={handleChangePassword} placeholder="Password"/>
                                {password.length <= 11 && <Form.Text id="passwordHelpBlock" muted>Password should be at least 12 characters long!</Form.Text>}
                            </Form.Group>
                            <Form.Group>
                                <Form.Label>Repeat new password</Form.Label>
                                <Form.Control type="password" name="validatePassword" value={validatePassword} onChange={handleChangeValidationPassword} placeholder="Confirm password" />
                                {password !== validatePassword && <Form.Text id="confirmPasswordHelpBlock" muted>Passwords should be the same!</Form.Text>}
                            </Form.Group>
                            {saving ?
                                <Button variant="primary" disabled className="submit">
                                Changing password...
                                <Spinner
                                    as="span"
                                    animation="border"
                                    size="sm"
                                    role="status"
                                    aria-hidden="true"
                                />
                                </Button> 
                                :
                                <Button variant="primary" type="submit" className="submit" disabled={password.length <= 11 || password !== validatePassword}>Change password</Button>}
                        </Form>
                    </div>
                </div>
            </section>
            <ToastContainer autoClose={4000}/>
        </div>


    )
}

export default Reset;