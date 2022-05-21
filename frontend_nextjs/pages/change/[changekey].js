import { useRouter } from "next/router";
import React, { useEffect } from 'react'
import { useState } from 'react';
import { ToastContainer, toast} from "react-toastify";
import LoadingPage from "../../Components/LoadingPage"
import { api, Url } from "../../utils/ApiClient";
import logoScreen from '../../public/assets/osoc-screen.png';
import Image from 'next/image'
import { Spinner, Button, Form } from "react-bootstrap";

const ChangeKey = () => {
    const router = useRouter();
    const {changekey} = router.query
    const [validKey, setValidKey] = useState(false);
    const [loading, setLoading] = useState(true);
    const [email, setEmail] = useState("");
    const [validateEmail, setValidateEmail] = useState("");
    const [saving, setSaving] = useState(false);

    const handleChangeEmail = (event) => {
        setEmail(event.target.value);
    }

    const handleChangeValidateEmail = (event) => {
        setValidateEmail(event.target.value);
    }

    useEffect(async () => {
        Url.fromName(api.change).extend(`/${changekey}`).get().then(resp =>{
            console.log(resp);
            if (resp.success) {
                setValidKey(true);
            }
        })
        setLoading(false);
    }, [changekey])

    const handleSubmit = async (event) => {
        event.preventDefault();
        setSaving(true);
        const data = {
            "email": email,
            "validateEmail": validateEmail
        }
        const resp = await Url.fromName(api.change).extend(`/${changekey}`).setBody(data).post();

        if (resp.success) {
            setSaving(false);
            toast.success(resp.data["message"]);
            await setTimeout(function(){
                router.push('/login');
            }, 4000);
        } else {
            setSaving(false);
            setFail(true);
            toast.error("Something went wrong, please try again");
        }
    }

    if (loading) {
        return <LoadingPage />
    }
    else if (!validKey) {
        return <h1>Not a valid change email key</h1>
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
                    <p className="welcome-message">Reset your email</p>
                    <div className="login-form">
                        <Form onSubmit={handleSubmit}>
                            <Form.Group>
                                <Form.Label>New email address</Form.Label>
                                <Form.Control type="email" name="email" value={email} onChange={handleChangeEmail} placeholder="New email"/>
                            </Form.Group>
                            <Form.Group>
                                <Form.Label>Repeat new email address</Form.Label>
                                <Form.Control type="email" name="validateEmail" value={validateEmail} onChange={handleChangeValidateEmail} placeholder="Confirm email" />
                                {email !== validateEmail && <Form.Text id="validateEmailHelpBlock" muted>Email should be the same!</Form.Text>}
                            </Form.Group>
                            {saving ?
                                <Button variant="primary" disabled className="submit">
                                Changing email...
                                <Spinner
                                    as="span"
                                    animation="border"
                                    size="sm"
                                    role="status"
                                    aria-hidden="true"
                                />
                                </Button> 
                                :
                                <Button variant="primary" type="submit" className="submit" disabled={email !== validateEmail || email === ""}>Change email</Button>}
                        </Form>
                    </div>
                </div>
            </section>
            <ToastContainer autoClose={4000}/>
        </div>
    )

}

export default ChangeKey;