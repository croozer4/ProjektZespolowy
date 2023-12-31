import {useState, useEffect} from 'react';
import {Link} from 'react-router-dom';
import {auth} from '../config/firebase';
import '../styles/NavbarComponentStyles.css';
import LoginComponent from './LoginComponent';
import logo from '../assets/pocketpal_logo.png';
import {Text} from '@mantine/core';

export function CustomNavbar() {
  const [userPhotoURL, setUserPhotoURL] = useState('');
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUserPhotoURL(user.photoURL || ''); // Ustaw URL zdjęcia profilowego
      } else {
        setUserPhotoURL(''); // Czyść URL zdjęcia profilowego
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    setIsMobile(window.innerWidth >= 768);

    const handleResize = () => {
      setIsMobile(window.innerWidth >= 768);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    auth.onAuthStateChanged((user) => {
      if (user) {
        setLoggedIn(true);
      } else {
        setLoggedIn(false);
      }
    });
  });

  return (
    <>
      <nav className="navbar">
        {/* <Router> */}
          <Link to="/" style={{color: "white"}}>
            <div className="logoContainer">
              <img src={logo} alt="PocketPal logo" className="logo"/>
              <Text size={'xl'}>PocketPal</Text>
            </div>
          </Link>
          <div className="navbarContent">
            {isMobile ? (
              <>
                <div className="nav_button">
                  {loggedIn ? (
                    <Link to="/family">
                      <Text>Rodzina</Text>
                    </Link>
                  ) : ""}
                </div>
              </>
            ) : ""}
            <div className="nav-button-container">
              <LoginComponent userPhotoURL={userPhotoURL}/>
            </div>
          </div>
        {/* </Router> */}
      </nav>
    </>
  );
}

export default CustomNavbar;
