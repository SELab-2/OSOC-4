import './App.css';
import Login from './Components/Login'
import { Route, Routes } from 'react-router-dom'
import { useEffect, useState } from "react";
import NavHeader from './Components/NavHeader.js'
import SelectUsers from "./Components/SelectUsers";
import Projects from "./Components/Projects";
import EmailUsers from "./Components/EmailUsers";
import Settings from "./Components/Settings";
import ErrorPage from "./Components/ErrorPage";

function App() {
    let [loggedInAs, setLoggedInAs] = useState(null);

    // todo uncomment this when get "/" returns your user id if you have the access_token cookie
    /*
    useEffect(() => { if (isStillAuthenticated()) {
        getJson("/").then(resp => setLoggedInAs(resp.data.id))
    }});
     */

    if (!loggedInAs) {
        return <Login setLoggedInAs={setLoggedInAs} />
    }

    return (
        <div className="App">
            <NavHeader setLoggedInAs={setLoggedInAs} />
            <Routes>
                <Route path='/select-users' element={<SelectUsers />} />
                <Route path='/email-users' element={<EmailUsers />} />
                <Route path='/projects' element={<Projects />} />
                <Route path='/settings' element={<Settings loggedInAs={loggedInAs} />} />
                <Route path="*" element={
                    <ErrorPage status={404} message={"Page not found"} />
                } />
            </Routes>
        </div>
    );
}

export default App;
