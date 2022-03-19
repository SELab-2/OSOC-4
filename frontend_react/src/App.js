import './App.css';
import Login from './Components/Login'
import { Route, Routes} from 'react-router-dom'
import { useState } from "react";
import NavHeader from './Components/NavHeader.js'
import SelectUsers from "./Components/SelectUsers";
import Projects from "./Components/Projects";
import RequireAuthentication from "./Components/authentication/RequireAuthentication";
import EmailUsers from "./Components/EmailUsers";
import Settings from "./Components/Settings";
import ErrorPage from "./Components/ErrorPage";

function App() {
  //TODO check if access token in present in cookies to find initial state
  let [isLoggedIn, setIsLoggedIn] = useState()

  return (
    <div className="App">
      <Routes>
        <Route path='/login' element={<Login setIsLoggedIn={setIsLoggedIn} />} />
        <Route path='/select-users' element={
            <RequireAuthentication isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn}>
                <NavHeader setIsLoggedIn={setIsLoggedIn} />
                <SelectUsers/>
            </RequireAuthentication>
        }/>
        <Route path='/email-users' element={
            <RequireAuthentication isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn}>
                <NavHeader setIsLoggedIn={setIsLoggedIn} />
                <EmailUsers/>
            </RequireAuthentication>
        }/>
        <Route path='/projects' element={
            <RequireAuthentication isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn}>
                <NavHeader setIsLoggedIn={setIsLoggedIn} />
                <Projects/>
            </RequireAuthentication>
        }/>
        <Route path='/settings' element={
            <RequireAuthentication isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn}>
                <NavHeader setIsLoggedIn={setIsLoggedIn} />
                <Settings/>
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
