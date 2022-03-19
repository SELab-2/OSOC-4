import './App.css';
import Login from './Components/Login'
import { Route, Routes} from 'react-router-dom'
import { useState } from "react";
import NavHeader from './Components/NavHeader.js'
import SelectUsers from "./Components/SelectUsers";
import Projects from "./Components/Projects";
import RequireAuthentication from "./Components/authentication/RequireAuthentication";
import EmailUsers from "./Components/EmailUsers";
import Settings from "./Components/Settings"

function App() {

  let [loggedInAs, setLoggedInAs] = useState(null)

  return (
    <div className="App">
        {(loggedInAs) ? <NavHeader setLoggedInAs={setLoggedInAs} /> : null}
      <Routes>
        <Route path='/login' element={<Login setLoggedInAs={setLoggedInAs} />} />
        <Route path='/select-users' element={
            <RequireAuthentication loggedInAs={loggedInAs} setLoggedInAs={setLoggedInAs}>
                <SelectUsers/>
            </RequireAuthentication>
        }/>
        <Route path='/email-users' element={
            <RequireAuthentication loggedInAs={loggedInAs} setLoggedInAs={setLoggedInAs}>
                <EmailUsers/>
            </RequireAuthentication>
        }/>
        <Route path='/projects' element={
            <RequireAuthentication loggedInAs={loggedInAs} setLoggedInAs={setLoggedInAs}>
                <Projects/>
            </RequireAuthentication>
        }/>
        <Route path='/settings' element={
            <RequireAuthentication loggedInAs={loggedInAs} setLoggedInAs={setLoggedInAs}>
                <Settings loggedInAs={loggedInAs}/>
            </RequireAuthentication>
        }/>
        </Routes>
    </div>
  );
}

export default App;
