import {useEffect, useState} from "react";
import {Url} from "../../utils/ApiClient";


export default function AdminCard(props){

    const [user, setUser] = useState({})
    const [loading, setLoading] = useState(false)
    const cssClasses = ["coach-div", "admin-div"]

    useEffect(() => {
        if(! loading) {
            setLoading(true)
            Url.fromUrl(props.user).get().then(async user => {
                if (user.success) {
                    console.log(user.data.data)
                    setUser(user.data.data)
                }
            })
        }
    }, [])

    function getCssClass(){
        if(Object.keys(user).length && user.role > 0){
            return cssClasses[user.role - 1]
        }
    }

    return (
        <div key={props.user} className={getCssClass()}>
            {user.name}
        </div>
    )

}