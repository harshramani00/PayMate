import React, {useState, useEffect } from "react";
import "./index.css"

const phrases = [
    "⏳ Save time. Split smarter.",
    "🔢 Less calculating, more chilling!",
    "📊 Precision splitting. No rounding fights!",
    "🏦 Be the CFO of your friend group (but effortlessly).",
    "🛠️ We crunch the numbers. You relax!",
    "🔥 Splitting bills just got an upgrade."
]

const LandingPage = () => {
    const [showPhrases, setShowPhrases] = useState(false);
    const [index, setIndex] = useState(0);
    const [showAuth, setShowAuth] = useState(false);
    const [animateUp, setAnimateUp] = useState(false);

    useEffect(() => {
        const phraseTimer = setTimeout(() => {
            setShowPhrases(true);
        }, 4000);

        return () => clearTimeout(phraseTimer);
    }, []);

    useEffect(() => {
        if (showPhrases){
            const phraseInterval = setInterval(() =>{
                setIndex((prevIndex) => (prevIndex + 1) % phrases.length);
            }, 3000);

            const authTimer = setTimeout(() => {
                setShowAuth(true);
                setAnimateUp(true);
            }, 1000);
        
            return () => {
                clearInterval(phraseInterval);
                clearTimeout(authTimer);
            };
        }
    }, [showPhrases]);

    return(
        <div className={`hero ${animateUp ? "move-up" : ""}`}>
            <h1 className="typewriter">Welcome to Paymate</h1>
            {showPhrases && <p key={index} className="catch-phrases">{phrases[index]}</p>}

        {showAuth && (
            <div className="auth-section">
                <div className="auth-option">
                    <p>Already with us?</p>
                    <button className="btn login-btn">Login</button>
                </div>
                <div className="divider"></div>
                <div className="auth-options">
                    <p>New here? Get started!</p>
                    <button className="btn signup-btn">Sign Up</button>
                </div>
            </div>
        )}
        </div>
    );
};

export default LandingPage;