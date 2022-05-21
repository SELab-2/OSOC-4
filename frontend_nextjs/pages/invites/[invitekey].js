import { useRouter } from 'next/router'
import React, { useEffect } from 'react'
import { useState } from 'react';
import LoadingPage from "../../Components/LoadingPage"
import { api, Url } from "../../utils/ApiClient";
import logoScreen from '../../public/assets/osoc-screen.png';
import Image from 'next/image'
import { ToastContainer, toast } from 'react-toastify';
import { Form , Button, Spinner} from 'react-bootstrap';

const Invite = () => {
    const router = useRouter()
    const { invitekey } = router.query
    const [validKey, setValidkey] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
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
        if (name === ""){toast.error("Please provide a name")};
        if (password <= 11) { toast.error("The new password is to short, it should be at least 12 characters long"); return; }
        if (password !== validatePassword) { toast.error("The two passwords don't match."); return; }
        setSaving(true);
        const j = {
            "validate_password": validatePassword,
            "password": password,
            "name": name,
        }
        const resp = await Url.fromName(api.invite).extend(`/${invitekey}`).setBody(j).post();
        if (resp.success) {
            toast.success("Account has successfully been submitted");
            toast.warning("You must now wait until an admin allows you to access the application");
        } else {
            toast.error("Something went wrong, please try again");
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
                        <Form onSubmit={handleSubmit}>
                            <Form.Group>
                                <Form.Label>Name</Form.Label>
                                <Form.Control type="name" name="name" value={name} onChange={handleChangeName} placeholder="Your name" />
                                {name === "" && <Form.Text id="nameHelpBlock" muted>Please provide your name</Form.Text>}
                            </Form.Group>
                            <Form.Group>
                                <Form.Label>Password</Form.Label>
                                <Form.Control type="password" name="password" value={password} onChange={handleChangePassword} placeholder="Password"/>
                                {password.length <= 11 && <Form.Text id="passwordHelpBlock" muted>Password should be at least 12 characters long!</Form.Text>}
                            </Form.Group>
                            <Form.Group>
                                <Form.Label>Repeat password</Form.Label>
                                <Form.Control type="password" name="validatePassword" value={validatePassword} onChange={handleChangeValidationPassword} placeholder="Confirm password" />
                                {password !== validatePassword && <Form.Text id="confirmPasswordHelpBlock" muted>Passwords should be the same!</Form.Text>}
                            </Form.Group>
                            {saving ? 
                            <Button variant="primary" disabled className="submit">
                            Saving...
                            <Spinner
                                as="span"
                                animation="border"
                                size="sm"
                                role="status"
                                aria-hidden="true"
                            />
                            </Button> 
                            :
                            <Button variant="primary" type="submit" className="submit" disabled={name === "" || password.length <= 11 || password !== validatePassword} on>Submit</Button>}
                        </Form>
                    </div>
                </div>
            </section>
            <ToastContainer autoClose={10000} />
        </div>

    )
}

export default Invite;