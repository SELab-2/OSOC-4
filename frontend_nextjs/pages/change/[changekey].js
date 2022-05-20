import { useRouter } from "next/router";
import React, { useEffect } from 'react'
import { useState } from 'react';
import LoadingPage from "../../Components/LoadingPage"
import { api, Url } from "../../utils/ApiClient";

const ChangeKey = () => {
    const router = useRouter();
    const {changekey} = router.query
    const [validKey, setValidKey] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(async () => {
        Url.fromName(api.change).extend(`/${changekey}`).get().then(resp =>{
            console.log(resp);
            if (resp.success) {
                setValidKey(true);
            }
        })
        setLoading(false);
    }, [changekey])

    if (loading) {
        return <LoadingPage />
    }
    else if (!validKey) {
        return <h1>Not a valid change email key: {changekey}</h1>
    }

    return (
        <h1>Gelukt!!!!</h1>
    )

}

export default ChangeKey;