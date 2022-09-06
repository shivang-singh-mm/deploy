import React, { useCallback } from 'react';
import styled from 'styled-components';

const BottomBar = ({
  clickChat,
  clickCameraDevice,
  goToBack,
  reloadPage,
  toggleCameraAudio,
  userVideoAudio,
  clickScreenSharing,
  screenShare,
  videoDevices,
  showVideoDevices,
  setShowVideoDevices,
  goToBuyCredits,
  enabled,
  isHost,
  endMeetForAll,
  clickUserList,
  toggleRaiseHand,
  userList
}) => {
  const handleToggle = useCallback(
    (e) => {
      setShowVideoDevices((state) => !state);
    },
    [setShowVideoDevices]
  );

  return (
    <Bar>
      {
        enabled
        ? 
        <>
      <Left>        
            <CameraButton onClick={toggleCameraAudio} data-switch="video">
              <div>
                {userVideoAudio.video ? (
                  <FaIcon className="fas fa-video"></FaIcon>
                ) : (
                  <FaIcon className="fas fa-video-slash"></FaIcon>
                )}
              </div>
              Camera
            </CameraButton>
            {showVideoDevices && (
              <SwitchList>
                {videoDevices.length > 0 &&
                  videoDevices.map((device) => {
                    return (
                      <div
                        key={device.deviceId}
                        onClick={clickCameraDevice}
                        data-value={device.deviceId}
                      >
                        {device.label}
                      </div>
                    );
                  })}
                <div>Switch Camera</div>
              </SwitchList>
            )}
            <SwitchMenu onClick={handleToggle}>
              <i className="fas fa-angle-up"></i>
            </SwitchMenu>
            <CameraButton onClick={toggleCameraAudio} data-switch="audio">
              <div>
                {userVideoAudio.audio ? (
                  <FaIcon className="fas fa-microphone"></FaIcon>
                ) : (
                  <FaIcon className="fas fa-microphone-slash"></FaIcon>
                )}
              </div>
              Audio
            </CameraButton>
          </Left>
        <Center>
        <UserListButton onClick={clickUserList}>
          <div>
            <FaIcon className="fas fa-users"></FaIcon>
          </div>
          Participants
        </UserListButton>
        <ChatButton onClick={clickChat}>
          <div>
            <FaIcon className="fas fa-comments"></FaIcon>
          </div>
          Chat
        </ChatButton>
        { isHost ?
          <ScreenButton onClick={clickScreenSharing}>
            <div>
              <FaIcon
                className={`fas fa-desktop ${screenShare ? 'sharing' : ''}`}
              ></FaIcon>
            </div>
            Share Screen
          </ScreenButton>
          :
          <RaiseHandButton style={{ color:  userList['localUser'].handRaised ? 'green' : 'white' }} onClick={() => {toggleRaiseHand( !(userList['localUser'].handRaised) )}}>
            <div>
              <FaIcon className='far fa-hand-paper'/>
            </div>
            Raise Hand
          </RaiseHandButton>
        } 
        <ResetButton onClick={reloadPage}>
          <div>
            <FaIcon style={{ }} className="fas fa-redo-alt"></FaIcon>
          </div>
          Reset
        </ResetButton>
      </Center>
      </>
       : 
          <Left>
        <ChatButton onClick={clickChat}>
          <div>
            <FaIcon className='fas fa-comments'></FaIcon>
          </div>
          Chat
        </ChatButton>
       </Left>
      }
      <Right>
        <PaymentButton onClick={goToBuyCredits}>Buy Credits</PaymentButton>
        <StopButton onClick={goToBack}>Leave</StopButton>
      { isHost 
        ?
          <StopButton onClick={endMeetForAll}>End</StopButton>
        : 
          <></>
      }
      </Right>
    </Bar>
  );
};

const Bar = styled.div`
  position: absolute;
  right: 0;
  bottom: 0;
  width: 100%;
  height: 8%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-weight: 500;
  background-color: #4ea1d3;
`;
const Left = styled.div`
  display: flex;
  align-items: center;

  margin-left: 15px;
`;

const Center = styled.div`
  flex: 1;
  display: flex;
  justify-content: center;
`;

const Right = styled.div`
  display: inline-flex;
  width: 300px;
  justify-content: space-between;
`;

const ChatButton = styled.div`
  width: 75px;
  border: none;
  font-size: 0.9375rem;
  padding: 5px;

  :hover {
    background-color: #77b7dd;
    cursor: pointer;
    border-radius: 15px;
  }

  * {
    pointer-events: none;
  }
`;

const ResetButton = styled.div`
  width: 75px;
  border: none;
  font-size: 0.9375rem;
  padding: 5px;

  :hover {
    background-color: #77b7dd;
    cursor: pointer;
    border-radius: 15px;
  }

  * {
    pointer-events: none;
  }
`;

const UserListButton = styled.div`
  width: 75px;
  border: none;
  font-size: 0.9375rem;
  padding: 5px;

  :hover {
    background-color: #77b7dd;
    cursor: pointer;
    border-radius: 15px;
  }

  * {
    pointer-events: none;
  }
`;

const RaiseHandButton = styled.div`
  width: 100px;
  border: none;
  font-size: 0.9375rem;
  padding: 5px;

  :hover {
    background-color: #77b7dd;
    cursor: pointer;
    border-radius: 15px;
  }

  * {
    pointer-events: none;
  }
`;

const ScreenButton = styled.div`
  width: auto;
  border: none;
  font-size: 0.9375rem;
  padding: 5px;

  :hover {
    background-color: #77b7dd;
    cursor: pointer;
    border-radius: 15px;
  }

  .sharing {
    color: #ee2560;
  }
`;

const FaIcon = styled.i`
  width: 30px;
  font-size: calc(16px + 1vmin);
`;

const StopButton = styled.div`
  width: 75px;
  height: 30px;
  border: none;
  font-size: 0.9375rem;
  line-height: 30px;
  margin-right: 15px;
  background-color: #ee2560;
  border-radius: 15px;
  padding: 0 6px;

  :hover {
    background-color: #f25483;
    cursor: pointer;
  }
`;

const PaymentButton = styled.div`
  width: 100px;
  height: 30px;
  border: none;
  font-size: 15px;
  line-height: 30px;
  margin-right: 15px;
  padding: 0 7px;
  background-color: #ee2560;
  border-radius: 15px;
  cursor: pointer;

  > a {
    text-decoration: none;
    color: white;
  }

  :hover {
    background-color: #f25483;
    cursor: pointer;
  }
`;

const CameraButton = styled.div`
  position: relative;
  width: 75px;
  border: none;
  font-size: 0.9375rem;
  padding: 5px;

  :hover {
    background-color: #77b7dd;
    cursor: pointer;
    border-radius: 15px;
  }

  * {
    pointer-events: none;
  }

  .fa-microphone-slash {
    color: #ee2560;
  }

  .fa-video-slash {
    color: #ee2560;
  }
`;

const SwitchMenu = styled.div`
  display: flex;
  position: absolute;
  width: 20px;
  top: 7px;
  left: 80px;
  z-index: 1;

  :hover {
    background-color: #476d84;
    cursor: pointer;
    border-radius: 15px;
  }

  * {
    pointer-events: none;
  }

  > i {
    width: 90%;
    font-size: calc(10px + 1vmin);
  }
`;

const SwitchList = styled.div`
  display: flex;
  flex-direction: column;
  position: absolute;
  top: -65.95px;
  left: 80px;
  background-color: #4ea1d3;
  color: white;
  padding-top: 5px;
  padding-right: 10px;
  padding-bottom: 5px;
  padding-left: 10px;
  text-align: left;

  > div {
    font-size: 0.85rem;
    padding: 1px;
    margin-bottom: 5px;

    :not(:last-child):hover {
      background-color: #77b7dd;
      cursor: pointer;
    }
  }

  > div:last-child {
    border-top: 1px solid white;
    cursor: context-menu !important;
  }
`;

export default BottomBar;