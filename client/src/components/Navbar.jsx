import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ThemeContext } from '../context/ThemeContext';

function Navbar() {
    const { theme, toggleTheme } = useContext(ThemeContext);
    const [isActive, setIsActive] = useState(false);
    
    // Use state for the user object so the component re-renders when it changes.
    const [user, setUser] = useState(null);

    const navigate = useNavigate();
    const location = useLocation(); // <-- This hook detects URL changes.

    // This 'useEffect' hook will run every time the page's location (URL) changes.
    useEffect(() => {
        // When the URL changes, we re-read the user data from localStorage.
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        } else {
            setUser(null);
        }
    }, [location]); // The dependency array makes this effect re-run on navigation.

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null); // Clear the user state immediately.
        setIsActive(false);
        navigate('/login');
    };

    const closeMenu = () => {
        setIsActive(false);
    };

    return (
        <nav className="navbar is-fixed-top" role="navigation" aria-label="main navigation">
            <div className="navbar-brand">
                <Link className="navbar-item title is-4" to={user ? "/dashboard" : "/login"}>DonorHub</Link>
                <a role="button" className={`navbar-burger ${isActive ? 'is-active' : ''}`} aria-label="menu" aria-expanded="false" onClick={() => setIsActive(!isActive)}>
                    <span aria-hidden="true"></span><span aria-hidden="true"></span><span aria-hidden="true"></span>
                </a>
            </div>

            <div className={`navbar-menu ${isActive ? 'is-active' : ''}`}>
                <div className="navbar-start">
                    {user && user.role === 'admin' && (
                        <Link className="navbar-item" to="/admin" onClick={closeMenu}>Admin Dashboard</Link>
                    )}
                    {user && (
                         <Link className="navbar-item" to="/conversations" onClick={closeMenu}>My Chats</Link>
                    )}
                </div>

                <div className="navbar-end">
                    <div className="navbar-item"><div className="field"><input id="themeSwitch" type="checkbox" name="themeSwitch" className="switch is-rounded" checked={theme === 'dark'} onChange={toggleTheme}/><label htmlFor="themeSwitch"><span className="icon ml-2"><i className={`fas ${theme === 'light' ? 'fa-moon' : 'fa-sun'}`}></i></span></label></div></div>
                    
                    {user && (
                        <Link to="/profile" className="navbar-item has-text-weight-bold" onClick={closeMenu}>
                            <span className="icon-text"><span className="icon"><i className="fas fa-user-circle"></i></span><span>My Profile</span></span>
                        </Link>
                    )}

                    <div className="navbar-item">
                        <div className="buttons">
                            {!user ? (
                                <>
                                    <Link className="button is-primary" to="/register" onClick={closeMenu}><strong>Sign up</strong></Link>
                                    <Link className="button is-light" to="/login" onClick={closeMenu}>Log in</Link>
                                </>
                            ) : (
                                <button className="button is-danger is-light" onClick={handleLogout}>
                                    <span className="icon"><i className="fas fa-sign-out-alt"></i></span>
                                    <span>Log out</span>
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
}

export default Navbar;