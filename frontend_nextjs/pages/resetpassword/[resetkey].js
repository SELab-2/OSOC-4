import { useRouter } from 'next/router'
import Error from 'next/error'
import React, { useEffect } from 'react'
import {check_resetkey, set_password, use_resetkey} from '../../utils/json-requests'
import { useState } from 'react';
import LoadingPage from "../../Components/LoadingPage"
import { Form, Button } from 'react-bootstrap';

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
        const data = {
            "password": password,
            "validate_password": validatePassword
        }
        const resp = await use_resetkey(resetkey, data);
        alert(resp["message"]);
        if (resp) {
            await router.push('/login');
        }
    }

    useEffect(() => {
        check_resetkey(resetkey).then(resp => {
            console.log(resp);
            if (resp) {setValidkey(true);}
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