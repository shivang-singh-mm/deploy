import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import styled from 'styled-components';
import axios from 'axios';

function VerifyOtp(props) {
  const [otp, setOtp] = useState();
  const [Loader, setLoader] = useState(false);

  document.title = 'Verify OTP';

  let history = useHistory();

  let role = sessionStorage.getItem('role');

  // function to set cookie
  const createCookie = (cookieName, cookieValue, daysToExpire) => {
    var date = new Date();
    date.setTime(date.getTime() + daysToExpire * 24 * 60 * 60 * 1000);
    document.cookie =
      cookieName + '=' + cookieValue + '; expires=' + date.toGMTString();
  };

  // axios request to sava a new astrologer or user depending on the role.
  let data = {
    otp,
    phone: sessionStorage.getItem('phone'),
  };

  const otpValidater = async () => {
    setLoader(true);
    await axios
      .post(
        'https://video-chat-backend99.herokuapp.com/api/user/verify-otp',
        data
      )
      .then((response) => {
        // console.log(response.data.message);
        createCookie('user', response.data.token, 1);
        props.checker(true);

        if (response.data.action === 'register') {
          if (response.data.role === 'user') {
            history.push('/');
          } else {
            role = response.data.role;
            sessionStorage.setItem('role', role);
            history.push('/astrologer-register');
          }
        } else if (response.data.action === 'login') {
          history.push('/');
        }
        setLoader(false);
      })
      .catch((err) => {
        console.log(err);
        props.checker(false);
        setLoader(false);
        alert('Something went wrong');
      });
  };

  return (
    <>
      <MainContainer>
        <Heading>Verify OTP</Heading>
        <Inner>
          <Row>
            <Label htmlFor="otp">One Time Password</Label>
            <Input
              type="number"
              id="otp"
              placeholder="XXXX"
              onChange={(event) => setOtp(event.target.value)}
            />
          </Row>
        </Inner>
        <SendButton onClick={otpValidater}>{Loader ? "Verify OTP": "Verify OTP"}</SendButton>
      </MainContainer>
    </>
  );
}

const MainContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: space-between;
  height: 100vh;
  width: 40vw;

  @media (max-width: 900px) {
    width: 90%;
    margin: 30px 30px;
  }
`;

const Heading = styled.div`
  width: 100%;
  text-align: center;
  font-size: 7vw;
  margin: 20px 0;
`;

const Inner = styled.div`
  margin-top: 80px;
`;

const Row = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 15px;
  line-height: 35px;
`;

const Label = styled.label``;

const Input = styled.input`
  width: 180px;
  height: 35px;
  margin-left: 15px;
  padding-left: 10px;
  outline: none;
  border: none;
  border-radius: 5px;
`;

const SendButton = styled.button`
  height: 40px;
  margin-top: 35px;
  outline: none;
  border: none;
  border-radius: 15px;
  color: #d8e9ef;
  background-color: #4ea1d3;
  font-size: 25px;
  font-weight: 500;

  :hover {
    background-color: #7bb1d1;
    cursor: pointer;
  }
`;

export default VerifyOtp;
