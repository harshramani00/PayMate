import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import LandingPage from "./components/LandingPage";
import SignUp from "./pages/SignUp/SignUp";
import SignIn from "./pages/SignIn/SignIn";
import ReceiptUpload from "./pages/ReceiptUpload/ReceiptUpload";
import "./App.css"
import Profile from "./pages/Profile/Profile";
import PrivateRoute from "./components/PrivateRoute";
import Header from './components/Header/Header';
import AssignSplits from "./pages/AssignSplits/AssignSplits";


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
        <Route path="/assign-splits/:id" element={
          <>
            <Header />
            <AssignSplits />
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