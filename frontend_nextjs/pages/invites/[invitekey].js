import { useRouter } from 'next/router'
import Error from 'next/error'
import { useEffect } from 'react'
import { check_invitekey, set_password } from '../../utils/json-requests'
import { useState } from 'react';
import LoadingPage from "../../Components/LoadingPage"
import { Form, Button } from 'react-bootstrap';

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
        const j = {
            "validate_password": validatePassword,
            "password": password,
            "name": name,
        }
        const resp = await set_password(invitekey, j);
        if (resp) {
            router.push('/login')
        }
    }

    useEffect(async () => {
        const resp = await check_invitekey(invitekey);

        console.log(resp);

        if (resp) {
            setValidkey(true);
        }
        setLoading(false);
    }, [invitekey])

    if (loading) {
        return <LoadingPage />
    }
    //  else if (!validKey) {
    //     return <h1>Not a valid invite</h1>
    // }

    return (
        <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="formBasicName">
                <Form.Label>Your Name</Form.Label>
                <Form.Control type="name" placeholder="Enter your name" onChange={handleChangeName} value={name} />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formBasicPassword">
                <Form.Label>Password</Form.Label>
                <Form.Control type="password" placeholder="Password" onChange={handleChangePassword} value={password} />
                <Form.Label>Confirm Password</Form.Label>
                <Form.Control type="password" placeholder="Password" onChange={handleChangeValidationPassword} value={validatePassword} />
            </Form.Group>
            <Button variant="primary" type="submit">
                Submit
            </Button>
        </Form>

    )
}

export default Invite;