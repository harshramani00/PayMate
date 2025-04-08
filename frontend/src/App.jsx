import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import LandingPage from "./components/LandingPage";
import SignUp from "./pages/SignUp/SignUp";
import SignIn from "./pages/SignIn/SignIn";
import ReceiptUpload from "./pages/ReceiptUpload/ReceiptUpload";
import Profile from "./pages/Profile/Profile";
import PrivateRoute from "./components/PrivateRoute";
import "./App.css";
import Header from './components/Header/Header';


function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Routes without header */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/sign-up" element={<SignUp />} />
        <Route path="/sign-in" element={<SignIn />} />
        
        <Route path="/scan-receipt" element={
          <>
            <Header />
            <ReceiptUpload />
          </>
        } />
        
        <Route element={<PrivateRoute />}>
          <Route path='/profile' element={<Profile />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;