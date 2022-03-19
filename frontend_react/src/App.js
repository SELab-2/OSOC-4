import './App.css';
import Login from './Components/Login'
import { Route, Routes} from 'react-router-dom'
import {useEffect, useState} from "react";
import NavHeader from './Components/NavHeader.js'
import SelectUsers from "./Components/SelectUsers";
import Projects from "./Components/Projects";
import RequireAuthentication from "./Components/authentication/RequireAuthentication";
import EmailUsers from "./Components/EmailUsers";
import Settings from "./Components/Settings";
import ErrorPage from "./Components/ErrorPage";
import {getJson, isStillAuthenticated} from "./utils/json-requests";

function App() {
    let [loggedInAs, setLoggedInAs] = useState(null);

    // todo uncomment this when get "/" returns your user id if you have the access_token cookie
    /*
    useEffect(() => { if (isStillAuthenticated()) {
        getJson("/").then(resp => setLoggedInAs(resp.data.id))
    }});
     */

    return (
    <div className="App">
      <Routes>
        <Route path='/login' element={<Login setLoggedInAs={setLoggedInAs} />} />
        <Route path='/select-users' element={
            <RequireAuthentication loggedInAs={loggedInAs} setLoggedInAs={setLoggedInAs}>
                <NavHeader setLoggedInAs={setLoggedInAs} />
                <SelectUsers/>
            </RequireAuthentication>
        }/>
        <Route path='/email-users' element={
            <RequireAuthentication loggedInAs={loggedInAs} setLoggedInAs={setLoggedInAs}>
                <NavHeader setLoggedInAs={setLoggedInAs} />
                <EmailUsers/>
            </RequireAuthentication>
        }/>
        <Route path='/projects' element={
            <RequireAuthentication loggedInAs={loggedInAs} setLoggedInAs={setLoggedInAs}>
                <NavHeader setLoggedInAs={setLoggedInAs} />
                <Projects/>
            </RequireAuthentication>
        }/>
        <Route path='/settings' element={
            <RequireAuthentication loggedInAs={loggedInAs} setLoggedInAs={setLoggedInAs}>
                <NavHeader setLoggedInAs={setLoggedInAs} />
                <Settings loggedInAs={loggedInAs}/>
            </RequireAuthentication>
        }/>
        <Route path="*" element={
            <ErrorPage status={404} message={"Page not found"}/>
        }/>
      </Routes>
    </div>
  );
}

export default App;
