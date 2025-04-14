import { FaSearch } from 'react-icons/fa';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
import './header.css'; // We'll create this file

export default function Header() {
  const { currentUser } = useSelector((state) => state.user);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = (e) => {
    e.preventDefault();
    const urlParams = new URLSearchParams(window.location.search);
    urlParams.set('searchTerm', searchTerm);
    const searchQuery = urlParams.toString();
    navigate(`/search?${searchQuery}`);
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const searchTermFromUrl = urlParams.get('searchTerm');
    if (searchTermFromUrl) {
      setSearchTerm(searchTermFromUrl);
    }
  }, [location.search]);

  return (
    <header className="header">
      <div className="header-container">
        <Link to='/' className="logo">
          PayMate
        </Link>

        <form onSubmit={handleSubmit} className="search-form">
          <input
            type='text'
            placeholder='Search...'
            className="search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button type="submit" className="search-button">
            <FaSearch />
          </button>
        </form>

        <nav className="nav-links">
          <Link to='/scan-receipt' className="nav-link">Upload</Link>
          <Link to='/history' className="nav-link">History</Link>
          <Link to='/about' className="nav-link">About</Link>
          <Link to='/profile' className="nav-link">
            {currentUser ? (
              <img
                className="profile-image"
                src={currentUser.avatar}
                alt='profile'
              />
            ) : (
              'Sign in'
            )}
          </Link>
        </nav>
      </div>
    </header>
  );
}