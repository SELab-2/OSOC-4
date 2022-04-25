import { useRouter } from 'next/router'
import Error from 'next/error'
import React, { useEffect } from 'react'
import { useState } from 'react';
import LoadingPage from "../../Components/LoadingPage"
import { Form, Button } from 'react-bootstrap';
import {api, Url} from "../../utils/ApiClient";

const Reset = () => {
    const router = useRouter()
    const { resetkey } = router.query
    const [validKey, setValidkey] = useState(false);
    const [loading, setLoading] = useState(true);

    const [password, setPassword] = useState("");
    const [validatePassword, setValidatePassword] = useState("");

    const handleChangePassword = (event) => {
        setPassword(event.target.value);
    }

    const handleChangeValidationPassword = (event) => {
        setValidatePassword(event.target.value);
    }

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (password <= 11) {alert("The new password is to short, it should be at least 12 characters long");return;}
        if (password !== validatePassword) {alert("The two passwords don't match.");return;}

        const data = {
            "password": password,
            "validate_password": validatePassword
        }
        const resp = await Url.fromName(api.resetpassword).extend(`/${resetkey}`).setBody(data).post();

        if (resp.success) {
            alert(resp.data["message"]);
            await router.push('/login');
        }
    }

    useEffect(() => {
        Url.fromName(api.resetpassword).extend(`/${resetkey}`).get().then(resp => {
            if (resp.success) {setValidkey(true);}
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
        <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="formBasicPassword">
                <Form.Label>Password</Form.Label>
                <Form.Control type="password" placeholder="Password" onChange={handleChangePassword} value={password} />
                {(password.length > 11) ? null : (<Form.Text className="text-muted">Password should be at least 12 characters long!</Form.Text>)}
                <br/>
                <Form.Label>Confirm Password</Form.Label>
                <Form.Control type="password" placeholder="Password" onChange={handleChangeValidationPassword} value={validatePassword} />
                {(password === validatePassword) ? null : (<Form.Text className="text-muted">Passwords should be the same!</Form.Text>)}
            </Form.Group>
            <Button variant="primary" type="submit">
                Submit
            </Button>
        </Form>
    )
}

export default Reset;