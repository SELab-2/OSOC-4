import { useRouter } from "next/router";
import React, { useEffect } from 'react'
import { useState } from 'react';
import { ToastContainer, toast} from "react-toastify";
import LoadingPage from "../../Components/LoadingPage"
import { api, Url } from "../../utils/ApiClient";
import logoScreen from '../../public/assets/osoc-screen.png';
import Image from 'next/image'
import { Spinner, Button } from "react-bootstrap";

const ChangeKey = () => {
    const router = useRouter();
    const {changekey} = router.query
    const [validKey, setValidKey] = useState(false);
    const [loading, setLoading] = useState(true);
    const [email, setEmail] = useState("");
    const [saving, setSaving] = useState(false);
    const [fail, setFail] = useState(false);

    const handleChangeEmail = (event) => {
        setEmail(event.target.value);
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
        setFail(false);
        const data = {"email": email}
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

    const tryAgain = (event) => {
        setFail(false);
        setEmail("");
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
                        <input type="email" name="email" value={email} onChange={handleChangeEmail} placeholder="New email" />
                        {!saving && ! fail &&
                        <button className="submit" onClick={handleSubmit}>
                            Submit
                        </button>}
                        {saving && 
                        <Button variant="primary" disabled>
                        Changing email...
                        <Spinner
                            as="span"
                            animation="border"
                            size="sm"
                            role="status"
                            aria-hidden="true"
                        />
                      </Button>}

                        {fail && 
                        <button className="submit" onClick={tryAgain}>
                        Try again
                        </button>}

                    </div>
                </div>
            </section>
            <ToastContainer autoClose={4000}/>
        </div>
    )

}

export default ChangeKey;