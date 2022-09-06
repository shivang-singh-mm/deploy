import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

function Navbar(props) {
  const [displayNav, setDisplayNav] = useState('none');

  const toggleNavBar = () => {
    console.log(displayNav);
    switch (displayNav) {
      case 'none':
        return setDisplayNav('flex');
      case 'flex':
        return setDisplayNav('none');
      default:
        return setDisplayNav('none');
    }
  };

  const deleteCookie = (cookieName, cookieValue, daysToExpire) => {
    var date = new Date();
    date.setTime(date.getTime() - daysToExpire * 24 * 60 * 60 * 1000);
    document.cookie =
      cookieName + '=' + cookieValue + '; expires=' + date.toGMTString();
  };

  const handleLogout = () => {
    // document.cookie = 'user=';
    deleteCookie('user', '', 1);
    props.setIsAuthenticated(false);
    window.location.reload();
  };

  let isAuthenticated = props.isAuthenticated;

  return (
    <Bar>
      <NavBarToggle onClick={() => toggleNavBar()}>
        <Hamburger />
      </NavBarToggle>
      <Logo>
        <NavLink>
          <Link style={{ textDecoration: 'none', color: 'white' }} to="/">
            Home
          </Link>
        </NavLink>
      </Logo>
      <MainNav display={displayNav}>
        <NavLi>
          <NavLink>
            <Link
              style={{ textDecoration: 'none', color: 'white' }}
              to="/astrologers"
            >
              Astrologers
            </Link>
          </NavLink>
        </NavLi>
        {isAuthenticated ? (
          <>
            <NavLi>
              <NavLink>
                <Link
                  style={{ textDecoration: 'none', color: 'white' }}
                  to="/profile"
                >
                  Profile
                </Link>
              </NavLink>
            </NavLi>
            <NavLi>
              <NavLink>
                <Link
                  style={{ textDecoration: 'none', color: 'white' }}
                  to="/buy-credits"
                >
                  Buy Credits
                </Link>
              </NavLink>
            </NavLi>
            <NavLi>
              <NavLink>
                <Link
                  style={{ textDecoration: 'none', color: 'white' }}
                  to="/payment-records"
                >
                  Payment Records
                </Link>
              </NavLink>
            </NavLi>
            <NavLi>
              <NavLink>
                <button
                  style={{
                    background: 'none',
                    color: 'white',
                    border: 'none',
                    outline: 'none',
                    fontSize: '18px',
                    margin: '0',
                    cursor: 'pointer',
                  }}
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </NavLink>
            </NavLi>
          </>
        ) : (
          <>
            <NavLi>
              <NavLink>
                <Link
                  style={{ textDecoration: 'none', color: 'white' }}
                  to="/login"
                >
                  Login
                </Link>
              </NavLink>
            </NavLi>
            <NavLi>
              <NavLink>
                <Link
                  style={{ textDecoration: 'none', color: 'white' }}
                  to="/register"
                >
                  Register
                </Link>
              </NavLink>
            </NavLi>
          </>
        )}
      </MainNav>
    </Bar>
  );
}

const Bar = styled.nav`
  position: absolute;
  top: 0;
  display: flex;
  justify-content: space-between;
  padding-bottom: 0;
  height: 70px;
  align-items: center;
  flex-direction: row;
  font-size: 18px;
  background-color: #454552;
  color: white;
  height: 10vh;
  width: 100%;
  padding-bottom: 10px;
  @media (max-width: 768px) {
  }
  @media (min-width: 768px) {
    display: flex;
    justify-content: space-between;
    padding-bottom: 0;
    height: 70px;
    align-items: center;
  }
  > a {
    text-decoration: none;
    color: white;
  }
`;

const MainNav = styled.ul`
  list-style-type: none;
  display: ${(props) => props.display};
  flex-direction: column;
  position: absolute;
  @media (max-width: 768px) {
    background: white;
    height: 100vh;
    width: 100%;
    color: black;
    position: absolute;
    top: 0;
    z-index: 100;
    margin: 0;
    overflow-x: hidden;
    padding: 0;
  }
  @media (min-width: 768px) {
    display: flex !important;
    margin-right: 30px;
    flex-direction: row;
    justify-content: flex-end;
    position: absolute;
    right: 0;
    top: 0;
  }
`;

const NavLi = styled.li`
  text-align: center;
  margin: 15px auto;
`;
const NavLink = styled.div`
  list-style-type: none;
  display: flex;
  text-decoration: none;
  color: white;
  flex-direction: column;
  @media (min-width: 768px) {
    margin: 0px 10px;
  }
`;
const Logo = styled.div`
  display: inline-block;
  font-size: 22px;
  margin-top: 10px;
  margin-left: 20px;
`;
const NavBarToggle = styled.span`
  position: absolute;
  top: 10px;
  right: 20px;
  cursor: pointer;
  color: rgba(255, 255, 255, 0.8);
  font-size: 24px;
`;
const Hamburger = styled.img`
  content: url(data:image/svg+xml,%3Csvg%20height%3D%2232px%22%20id%3D%22Layer_1%22%20style%3D%22enable-background%3Anew%200%200%2032%2032%3B%22%20version%3D%221.1%22%20viewBox%3D%220%200%2032%2032%22%20width%3D%2232px%22%20xml%3Aspace%3D%22preserve%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20xmlns%3Axlink%3D%22http%3A%2F%2Fwww.w3.org%2F1999%2Fxlink%22%3E%3Cpath%20d%3D%22M4%2C10h24c1.104%2C0%2C2-0.896%2C2-2s-0.896-2-2-2H4C2.896%2C6%2C2%2C6.896%2C2%2C8S2.896%2C10%2C4%2C10z%20M28%2C14H4c-1.104%2C0-2%2C0.896-2%2C2%20%20s0.896%2C2%2C2%2C2h24c1.104%2C0%2C2-0.896%2C2-2S29.104%2C14%2C28%2C14z%20M28%2C22H4c-1.104%2C0-2%2C0.896-2%2C2s0.896%2C2%2C2%2C2h24c1.104%2C0%2C2-0.896%2C2-2%20%20S29.104%2C22%2C28%2C22z%22%2F%3E%3C%2Fsvg%3E);
  @media (min-width: 768px) {
    display: none;
  }
`;

export default Navbar;
