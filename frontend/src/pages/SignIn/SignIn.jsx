import {useState} from 'react'
import { Link, useNavigate } from 'react-router-dom';
import './SignIn.css'

export default function SignIn() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try{
      setLoading(true);
      const res = await fetch('/server/auth/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      console.log(data);
      if (data.error) {
        setLoading(false);
        setError(data.error);
        return;
      }
      setLoading(false);
      navigate('/scan-receipt');
    } catch (err) {
      setLoading(false);
      setError("An error occured. Please try again.");
    }
  };

  return (
    <div className="signin-container">
      <h2>Sign In</h2>
      {error && <p className="error">{error}</p>}
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          id="email"
          value={formData.email}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          placeholder="Password"
          id="password"
          value={formData.password}
          onChange={handleChange}
          required
        />
        <button disabled={loading}>
          {loading ? 'Loading...' : 'Sign In'}
        </button>
      </form>
      <div className="flex">
        <p>Don't have an account?</p>
        <Link to="/sign-up">
          <span>Sign up</span>
        </Link>
      </div>
      {error && <p className="text-red-500">{error}</p>}
    </div>
  );
    
}
