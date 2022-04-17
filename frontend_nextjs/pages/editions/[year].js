import { useRouter } from 'next/router'
import React, { useEffect } from 'react'
import { useState } from 'react';
import LoadingPage from "../../Components/LoadingPage"
import {api, Url} from "../../utils/ApiClient";

const Edition = () => {
    const router = useRouter()
    const [loading, setLoading] = useState(true);
    const [edition, setEdition] = useState(true);
    const { year } = router.query

    useEffect(() => {
        Url.fromName(api.editions).extend(`/${year}`).get().then(resp => {
            if (resp.success) {
                setEdition(resp.data);
            }
            setLoading(false);
        });
    }, [year]);


    if (loading) {
        return <LoadingPage />
    }

    console.log("The current edition:");
    console.log(edition);

    return (
        <>
            <p>Edition detail</p>
            <h1>{edition.name}</h1>
        </>
    )
}

export default Edition;