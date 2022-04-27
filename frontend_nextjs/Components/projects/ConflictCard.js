import {Button, Card} from "react-bootstrap";
import {useEffect, useState} from "react";
import {api, Url} from "../../utils/ApiClient";


export default function ConflictCard() {
    const [conflicts, setConflicts] = useState([])


    useEffect(() => {
        Url.fromName(api.current_edition).extend("/resolving_conflicts").get().then(res => {
            if(res.success){
                setConflicts(res.data)
            }
        })
    }, [])

    return(
        <div>
            <Button variant={"conflicts"}>conflicts {conflicts.length}</Button>
        </div>
    )
}