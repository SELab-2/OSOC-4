import { useRouter } from "next/router";
import React, { useEffect } from 'react'
import { useState } from 'react';
import { ToastContainer, toast} from "react-toastify";
import LoadingPage from "../../Components/LoadingPage"
import { api, Url } from "../../utils/ApiClient";
import logoScreen from '../../public/assets/osoc-screen.png';
import Image from 'next/image'

const ChangeKey = () => {
    const router = useRouter();
    const {changekey} = router.query
    const [validKey, setValidKey] = useState(false);
    const [loading, setLoading] = useState(true);
    const [email, setEmail] = useState("");

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
        const data = {"email": email}
        const resp = await Url.fromName(api.change).extend(`/${changekey}`).setBody(data).post();

        if (resp.success) {
            toast.success(resp.data["message"]);
            await router.push('/login');
        } else {
            console.log("Niet gelukt");
            console.log(resp);
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
                        <input type="email" name="email" value={email} onChange={handleChangeEmail} placeholder="New email" />
                        <button className="submit" onClick={handleSubmit}>
                            Submit
                        </button>

                    </div>
                </div>
            </section>
            <ToastContainer/>
        </div>
    )

}

export default ChangeKey;