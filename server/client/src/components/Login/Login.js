import React, { useState } from 'react';
import {Link} from 'react-router-dom'
import styled from 'styled-components';
import axios from 'axios';

function Login(props) {
  const [phone, setPhone] = useState();
  const [Loader, setLoader] = useState(false);
  document.title = 'Login Page';

  let data = {
    phone,
  };

  // send phone to backend for login
  const postData = async () => {
    setLoader(true);
    await axios
      .post('https://video-chat-backend99.herokuapp.com/api/user/get-otp', data)
      .then((response) => {
        // console.log(response.data);
        sessionStorage.setItem('phone', phone);
        sessionStorage.setItem('role', '');
        props.history.push('/verify-otp');
        setLoader(false);
      })
      .catch((err) => {
        console.log(err);
        setLoader(false);
        alert('Something went wrong');
      });
  };

  return (
    <>
      <MainContainer>
        <Heading>Provide your phone number to talk with your astrologer</Heading>
        <Inner>
          <Row>
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              type="phone"
              id="phone"
              placeholder="+91XXXXXXXXXX"
              onChange={(event) => setPhone(event.target.value)}
            />
            {/* <PhoneInput
              id="phone"
              required
              placeholder="+91XXXXXXXXXX"
              value={phone}
              onChange={setPhone}
              style={{
                width: '30px',
                height: '35px',
                marginLeft: '5px',
                outline: 'none',
                border: 'none',
                borderRadius: '5px',
              }}
            /> */}
          </Row>
        </Inner>
        <SendButton onClick={postData}>{Loader ? "OTP Sent Successfully!": "Get OTP"}</SendButton>
        <SendButton><Link style={{textDecoration: 'none', color: 'white'}} to="/register">New here ? Register!</Link></SendButton>
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
  font-size: 3vw;
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

export default Login;
