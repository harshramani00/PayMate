import React from 'react';
import './About.css';

export default function About() {
  return (
    <div className="about-container">
      <h1>About PayMate</h1>
      <p className="subtext">
        A project created for CS 5340 at Northeastern University
      </p>

      <div className="section">
        <h2>👋 Meet the Team</h2>
        <p>
          PayMate was developed by <strong>Dhruv Belai</strong>, <strong>Aditya Bhanwadiya</strong>, and <strong>Kaustubh Chaudhari</strong> — a team passionate about building clean solutions for everyday problems.
        </p>
      </div>

      <div className="section">
        <h2>💡 Our Motivation</h2>
        <p>
          Splitting bills shouldn’t feel like a maneuver — it should be quick, accurate, and fair. We created PayMate to eliminate the stress and confusion around shared expenses.
        </p>
      </div>

      <div className="section">
        <h2>🛠️ How It Works</h2>
        <p>
          Built using the <strong>MERN stack</strong>, PayMate combines the power of <strong>Tesseract OCR</strong> to scan your receipts and the <strong>OpenAI API</strong> to intelligently extract item details and prices.
          You can upload a receipt, assign items to people, and we’ll handle the math — including tax, tip, and discounts — so you don’t have to.
        </p>
      </div>

      <div className="footer-note">
        Made with ☕ and collaboration ✨
      </div>
    </div>
  );
}
