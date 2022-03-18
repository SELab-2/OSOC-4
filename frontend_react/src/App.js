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

  let [isLoggedIn, setIsLoggedIn] = useState()

  return (
    <div className="App">
        {(isLoggedIn) ? <NavHeader setIsLoggedIn={setIsLoggedIn} /> : null}
      <Routes>
        <Route path='/login' element={<Login setIsLoggedIn={setIsLoggedIn} />} />
        <Route path='/select-users' element={
            <RequireAuthentication isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn}>
                <SelectUsers/>
            </RequireAuthentication>
        }/>
        <Route path='/email-users' element={
            <RequireAuthentication isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn}>
                <EmailUsers/>
            </RequireAuthentication>
        }/>
        <Route path='/projects' element={
            <RequireAuthentication isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn}>
                <Projects/>
            </RequireAuthentication>
        }/>
        <Route path='/settings' element={
            <RequireAuthentication isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn}>
                <Settings/>
            </RequireAuthentication>
        }/>
        </Routes>
    </div>
  );
}

export default App;
