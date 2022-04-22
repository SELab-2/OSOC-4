import {Card} from "react-bootstrap";
import {useEffect, useState} from "react";
import {Url} from "../../utils/ApiClient";


export default function AdminCard(props){

    const [user, setUser] = useState([])
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if(! loading) {
            setLoading(true)
            Url.fromUrl(props.user).get().then(async user => {
                if (user.success) {
                    setUser(user.data.data)
                }
            })
        }
    })

    return (
        <Card>
            <p>{user.name}</p>
        </Card>
    )

}