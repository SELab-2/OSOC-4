import { useRouter } from "next/router";
import React, { useEffect } from 'react'
import { useState } from 'react';
import { ToastContainer, toast} from "react-toastify";
import LoadingPage from "../../Components/LoadingPage"
import { api, Url } from "../../utils/ApiClient";
import logoScreen from '../../public/assets/osoc-screen.png';
import Image from 'next/image'
import { Spinner, Button } from "react-bootstrap";

const ConfirmKey = () => {
    const router = useRouter();
    const {confirmkey} = router.query
    const [validKey, setValidKey] = useState(false);
    const [loading, setLoading] = useState(true);
    const [email, setEmail] = useState("");
    const [saving, setSaving] = useState(false);
    const [fail, setFail] = useState(false);

    useEffect(async () => {
        Url.fromName(api.confirm).extend(`/${confirmkey}`).get().then(resp =>{
            console.log(resp);
            if (resp.success) {
                setValidKey(true);
            }
        })
        setLoading(false);
    }, [confirmkey])

    if (loading) {
        return <LoadingPage />
    }
    else if (!validKey) {
        return <h1>Not a valid confirm email key</h1>
    }

    return (
        <h1>Gelukt!!!</h1>
    )
}

export default ConfirmKey;