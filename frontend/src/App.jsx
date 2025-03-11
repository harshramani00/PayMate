import React from "react";
import { BrowserRouter as Router, Route, Routes, BrowserRouter } from "react-router-dom";
import LandingPage from "./components/LandingPage";
import SignUp from "./pages/SignUp/SignUp";
import SignIn from "./pages/SignIn/SignIn";
import ReceiptScan from "./pages/ReceiptScan/ReceiptScan"

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/sign-up" element={<SignUp />} />
        <Route path="/sign-in" element={<SignIn />} />
        <Route path="/scan-receipt" element={<ReceiptScan />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;