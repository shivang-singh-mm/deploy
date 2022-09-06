import React, { useState, useEffect, useRef } from "react";
import { useHistory} from 'react-router'
import Peer from "simple-peer";
import styled from "styled-components";
import socket from "../../socket";
import VideoCard from "../Video/VideoCard";
import BottomBar from "../BottomBar/BottomBar";
import Chat from "../Chat/Chat";
import UserList from "../UserList/UserList";
import axios from 'axios'

const Room = (props) => {
  const currentUser = sessionStorage.getItem("user");
  const [peers, setPeers] = useState([]);
  const [userVideoAudio, setUserVideoAudio] = useState({
    localUser: { video: true, audio: true, userId: 'localUser', isHost: false, enabled: false, handRaised: false },
  });
  const [videoDevices, setVideoDevices] = useState([]);
  const [displayChatOrList, setDisplayChatOrList] = useState(0);    // 0 => None, 1 => chat, 2 => list
  const [screenShare, setScreenShare] = useState(false);
  const [showVideoDevices, setShowVideoDevices] = useState(false);
  const peersRef = useRef([]);
  const userVideoRef = useRef();
  const screenTrackRef = useRef();
  const userStream = useRef();
  const roomId = props.match.params.roomId;
  const [bottomBarButtonsEnabler, setBottomBarButtonsEnabler] = useState(true);
  const [isHost, setIsHost] = useState(false);
  const [chatEnabled, setChatEnabled] = useState(true);
  const [showText, setShowText] = useState(true);

  document.title = `Room - ${roomId}`

  useEffect(() => {
    // console.log(JSON.parse(sessionStorage.getItem("userI")).eTime);
    if(JSON.parse(sessionStorage.getItem("userI")) === null || JSON.parse(sessionStorage.getItem("userI")).eTime === undefined){
      return window.location.href = "/";
    }
    if(JSON.parse(sessionStorage.getItem("userI")).id == roomId){
      setIsHost(true);
      setUserVideoAudio((preList) => {
        return {
          ...preList,
          localUser: { video: true, audio: true, userId: 'localUser', isHost: true, enabled: true, handRaised: false }
        }
      });
      
    }
    // Get Video Devices
    navigator.mediaDevices.enumerateDevices().then((devices) => {
      const filtered = devices.filter((device) => device.kind === "videoinput");
      setVideoDevices(filtered);
      console.log("filtered: ",filtered);
    });

    // Set Back Button Event
    window.addEventListener("popstate", goToBack);

    // Handle close event when user presses cross or Alt + F4 / Ctrl + W
    // To be fixed
    // window.onbeforeunload = () => {
    //   socket.emit("BE-leave-room", { roomId, leaver: currentUser });
    //   props.history.push("/");
    //   sessionStorage.removeItem("user");
    //   return "...";
    // }

    // Connect Camera & Mic
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        
        userVideoRef.current.srcObject = stream;
        userStream.current = stream;
        socket.emit("BE-join-room", { roomId, userName: currentUser, userId: JSON.parse(sessionStorage.getItem("userI")).id });

        const interval = setInterval(() => {
          let eTime = Math.ceil(JSON.parse(sessionStorage.getItem("userI")).eTime);
          let currTime = Math.ceil(Date.now() / 1000);
          console.log("eTime - " + eTime);
          console.log("currTime - " + currTime);
          if (currTime >= eTime) {
            setBottomBarButtonsEnabler(false);
            alert("Time Up : Credits Expired the camera and audio will stop withing 10 secs");
            const eTime = Math.ceil(JSON.parse(sessionStorage.getItem('userI')).eTime);
            const leaveTime = Math.ceil(Date.now() / 1000);
            axios
              .post('https://video-chat-backend99.herokuapp.com/api/user/credit-saver', {
                eTime,
                leaveTime,
                currentUser,
              }).then((res) => {
                console.log(res);
                console.log("Your credits has been exhausted");
              })
              .catch((err) => {
                console.log(err);
              });
            // setTimeout((stream) => stopStreamingCameraAndAudio(stream), 10000);
            setTimeout(disabler, 10000);
            return clearInterval(interval);
          }
        }, 5000);
    
        console.log("stream", stream);
        
        if(JSON.parse(sessionStorage.getItem("userI")).id != roomId){
          console.log("disabler called");
          setTimeout(disabler, 3000);
        }

        socket.on("FE-user-join", (users) => {
          // all users
          const peers = [];
          users.forEach(({ userId, info }) => {
            let { userName, video, audio, isHost, enabled } = info;

            if (userName !== currentUser) {
              const peer = createPeer(userId, socket.id, stream);

              peer.userName = userName;
              peer.peerID = userId;

              peersRef.current.push({
                peerID: userId,
                peer,
                userName,
              });
              console.log(peers);
              peers.push(peer);
              console.log(peers);

              setUserVideoAudio((preList) => {
                return {
                  ...preList,
                  [peer.userName]: { video, audio, userId, isHost, enabled, handRaised: false },
                };
              });
            }
          });

          setPeers(peers);
        });

        socket.on("FE-receive-call", ({ signal, from, info }) => {
          let { userName, video, audio, isHost, enabled } = info;
          const peerIdx = findPeer(from);

          if (!peerIdx) {
            const peer = addPeer(signal, from, stream);

            peer.userName = userName;

            peersRef.current.push({
              peerID: from,
              peer,
              userName: userName,
            });
            setPeers((users) => {
              return [...users, peer];
            });
            setUserVideoAudio((preList) => {
              return {
                ...preList,
                [peer.userName]: { video, audio, userId: from, isHost, enabled, handRaised: false },
              };
            });
          }
        });

        socket.on("FE-call-accepted", ({ signal, answerId }) => {
          const peerIdx = findPeer(answerId);
          peerIdx.peer.signal(signal);
        });

        socket.on("FE-user-leave", ({ userId, userName }) => {
          const peerIdx = findPeer(userId);
          peerIdx.peer.destroy();
          setPeers((users) => {
            users = users.filter((user) => user.peerID !== peerIdx.peer.peerID);
            return [...users];
          });
          peersRef.current = peersRef.current.filter(
            ({ peerID }) => peerID !== userId
          );

          // below code is yet to be fully tested
          setUserVideoAudio((preList) => {
            console.log(preList);
            delete preList[userName];
            console.log(preList);
            return {
              ...preList
            };
          });
        });
      });

    socket.on("FE-toggle-camera", ({ userId, switchTarget }) => {
      const peerIdx = findPeer(userId);

      setUserVideoAudio((preList) => {
        let {video, audio, isHost, enabled, handRaised} = preList[peerIdx.userName];

        if (switchTarget === "video") video = !video;
        else if(switchTarget === "both") { 
          video = false;
          audio = false;
          enabled = false;
          handRaised = false;
        }
        else audio = !audio;

        return {
          ...preList,
          [peerIdx.userName]: { video, audio, userId, isHost, enabled, handRaised },
        };
      });
    });
    
    socket.on('FE-media-close', ({ targetType }) => {
      toggleCameraAudio(targetType);
    });

    socket.on('FE-end-meet', () => {
      goToBack();
    });

    socket.on("FE-chat-toggler", ({ enableChat }) => {
      setChatEnabled(enableChat);
    });

    socket.on("FE-toggle-enabled", ({ target, newState, targetName }) => {
      try{
        if(newState){
          // console.log("-----------------------"+video+", "+audio);
          setUserVideoAudio((preList) => {
            let {video, audio, userId, isHost} = preList['localUser'];
//             console.log("-----------------------"+video+", "+audio);
            return {
              ...preList,
              localUser: {video, audio, userId, isHost, enabled: true, handRaised: false},    // when the host enables user, hand is set to unraised state
            }
          });
          socket.emit("BE-list-updator", {roomId, newState, target, targetName});
        }else{
          toggleCameraAudio('both');
        }
      }catch(error){
        console.log(error);
      }
    });

    socket.on("FE-list-updator", ({ target, newState, targetName }) => {
      setUserVideoAudio((preList) => {
        let {video, audio, userId, isHost} = preList[targetName];
        return {
          ...preList,
          [targetName]: { video, audio, userId, isHost, enabled: newState, handRaised: false }
        }
      });
    });

    socket.on("FE-toggle-RH", ({ newHandState, userName }) => {
      setUserVideoAudio((preList) => {
        let {video, audio, userId, isHost, enabled} = preList[userName];
        return {
          ...preList,
          [userName]: { video, audio, userId, isHost, enabled, handRaised: newHandState }
        }
      });
    });

    // alert("If Your video fails to load, please press the reset button in the bottom bar.")

    return () => {
      // clearInterval(interval);
      socket.disconnect();
    };
    // eslint-disable-next-line
  }, []);

  // function for connect camera and mic

  function createPeer(userId, caller, stream) {
    const peer = new Peer({
      initiator: true,
      trickle: false,
      stream,
    });

    peer.on("signal", (signal) => {
      socket.emit("BE-call-user", {
        userToCall: userId,
        from: caller,
        signal,
      });
    });
    peer.on("disconnect", () => {
      peer.destroy();
    });

    return peer;
  }

  function addPeer(incomingSignal, callerId, stream) {
    const peer = new Peer({
      initiator: false,
      trickle: false,
      stream,
    });

    peer.on("signal", (signal) => {
      socket.emit("BE-accept-call", { signal, to: callerId });
    });

    peer.on("disconnect", () => {
      peer.destroy();
    });

    peer.signal(incomingSignal);

    return peer;
  }

  function findPeer(id) {
    return peersRef.current.find((p) => p.peerID === id);
  }
  function createUserVideo(peer, index, arr) {
    return (
      <VideoBox
        className={`width-peer${peers.length > 8 ? "" : peers.length}`}
        onClick={expandScreen}
        key={index}
      >
        {writeUserName(peer.userName)}
        <FaIcon className="fas fa-expand" />
        <MicIcon className={ userVideoAudio[peer.userName] && userVideoAudio[peer.userName].audio ? 'fas fa-microphone' : 'fas fa-microphone-slash'} />
        <VideoCard key={index} peer={peer} number={arr.length} />
      </VideoBox>
    );
  }

  function writeUserName(userName, index) {
    if (userVideoAudio.hasOwnProperty(userName)) {
      if (!userVideoAudio[userName].video) {
        return <UserName key={userName}>{userName}</UserName>;
      }
    }
  }

  // Open Chat
  const clickChat = (e) => {
    e.stopPropagation();
    if(displayChatOrList != 1){
      setDisplayChatOrList(1);
    }else{
      setDisplayChatOrList(0);
    }
  };

  // Open participants list
  const clickUserList = (e) => {
    e.stopPropagation();
    if(displayChatOrList != 2){
      setDisplayChatOrList(2);
    }else{
      setDisplayChatOrList(0);
    }
  }

  const disabler = () =>{
    console.log("inside disabler");
    toggleCameraAudio('both');
  }

  // BackButton
  const goToBack = async (e) => {
    if(e){
      e.preventDefault();
    }
    const eTime = Math.ceil(JSON.parse(sessionStorage.getItem('userI')).eTime);
    const leaveTime = Math.ceil(Date.now() / 1000);
    await axios
      .post('https://video-chat-backend99.herokuapp.com/api/user/credit-saver', {
        eTime,
        leaveTime,
        currentUser,
      })
      .then((response) => {
        console.log(response);
        socket.emit('BE-leave-room', { roomId, leaver: currentUser });
        sessionStorage.removeItem('user');
        window.location.href = '/';
      })
      .catch((err) => {
        console.log(err);
        alert('Unable to leave meet');
      });
  };

  // function stopStreamingCameraAndAudio(stream){
  //   stream.getTracks().forEach(function(track) {
  //     if (track.readyState == 'live') {
  //         track.stop();
  //     }
  //   });
  // }

  const reloadPage = (e) => {
     if(e){
      e.preventDefault();
    }
    // const eTime = Math.ceil(JSON.parse(sessionStorage.getItem('userI')).eTime);
    // const leaveTime = Math.ceil(Date.now() / 1000);
    // await axios
    //   .post('http://localhost:5000/api/user/credit-saver', {
    //     eTime,
    //     leaveTime,
    //     currentUser,
    //   })
      // .then((response) => {
        // console.log(response);
        socket.emit('BE-leave-room', { roomId, leaver: currentUser });
        // sessionStorage.removeItem('user');
    window.location.href = `/room/${roomId}`;
    // console.log("$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$")
    // props.history.push(`/room/${roomId}`)
    // console.log("$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$")

      // })
  }

  const endMeetForAll = (e) => {
    e.preventDefault();
    socket.emit("BE-remove-user", { roomId, target: 'all' });
    goToBack();
  }

  const chatToggleForAll = () => {
    socket.emit("BE-chat-toggler", { roomId, chatEnabled: !chatEnabled });
    setChatEnabled(!chatEnabled);
  }

  const toggleCameraAudio = (e) => {
    console.log(e, " and enabled - ", userVideoAudio['localUser'].enabled);
    if( userVideoAudio['localUser'].enabled || e == 'both' || e == 'videoH' || e == 'audioH' ){
      console.log("Toggle the media, (enabled)");
      let target;
      if(e == 'videoH' || e == 'audioH'){
        target = e.slice(0, -1);
      }else if(e === 'video' || e === 'audio' || e === 'both' ){
        target = e;
      }else{
        target = e.target.getAttribute("data-switch");
      }
      console.log( "target: ", target);
      setUserVideoAudio((preList) => {
        let videoSwitch = preList["localUser"].video;
        let audioSwitch = preList["localUser"].audio;
        let { isHost, enabled, userId, handRaised } = preList["localUser"];
        console.log(target + ", " + videoSwitch + ", " + audioSwitch);
        if(target === "both"){
          enabled = false;
          handRaised = false;
          if(videoSwitch){
            const userVideoTrack =
            userVideoRef.current.srcObject.getVideoTracks()[0];
            userVideoTrack.enabled = false;
            videoSwitch = false;
          }
          if(audioSwitch){
            const userAudioTrack =
            userVideoRef.current.srcObject.getAudioTracks()[0];
            if (userAudioTrack) {
              userAudioTrack.enabled = false;
            } else {
              userStream.current.getAudioTracks()[0].enabled = false;
            }
            audioSwitch = false;
          }
        }
        else if (target === "video") {
          const userVideoTrack =
          userVideoRef.current.srcObject.getVideoTracks()[0];
          videoSwitch = !videoSwitch;
          userVideoTrack.enabled = videoSwitch;
          console.log("userVideoTrack : " , userVideoTrack);
        }
        else if(target === "audio"){
          const userAudioTrack =
          userVideoRef.current.srcObject.getAudioTracks()[0];
          audioSwitch = !audioSwitch;
          console.log( "userAudioTrack : ", userAudioTrack);
          
          if (userAudioTrack) {
            userAudioTrack.enabled = audioSwitch;
          } else {
            userStream.current.getAudioTracks()[0].enabled = audioSwitch;
          }
        }
        
        console.log(target + ", " + videoSwitch + ", " + audioSwitch);
        return {
          ...preList,
          localUser: { video: videoSwitch, audio: audioSwitch, userId: 'localUser', isHost, enabled, handRaised },
        };
      });
      if(e === 'both'){
        socket.emit("BE-toggle-both", {roomId});
      }else{
        socket.emit("BE-toggle-camera-audio", { roomId, switchTarget: target });
      }
    }else{
      console.log("Can't toggle the media, (not enabled)");
    }
  };

  const toggleRaiseHand = (newHandState) => {
    setUserVideoAudio((preList) => {
      let {video, audio, userId, isHost, enabled, handRaised} = preList['localUser'];
      handRaised = !handRaised;
      return {
        ...preList,
        localUser: { video, audio, userId, isHost, enabled, handRaised },
      }
    });
    socket.emit("BE-toggle-RH", { roomId, newHandState, userName: sessionStorage.getItem('user') });
  };

  const clickScreenSharing = () => {
    if (!screenShare) {
      navigator.mediaDevices
        .getDisplayMedia({ cursor: true })
        .then((stream) => {
          const screenTrack = stream.getTracks()[0];

          peersRef.current.forEach(({ peer }) => {
            // replaceTrack (oldTrack, newTrack, oldStream);
            peer.replaceTrack(
              peer.streams[0]
                .getTracks()
                .find((track) => track.kind === "video"),
              screenTrack,
              userStream.current
            );
          });

          // Listen click end
          screenTrack.onended = () => {
            peersRef.current.forEach(({ peer }) => {
              peer.replaceTrack(
                screenTrack,
                peer.streams[0]
                  .getTracks()
                  .find((track) => track.kind === "video"),
                userStream.current
              );
            });
            userVideoRef.current.srcObject = userStream.current;
            setScreenShare(false);
          };

          userVideoRef.current.srcObject = stream;
          screenTrackRef.current = screenTrack;
          setScreenShare(true);
        });
    } else {
      screenTrackRef.current.onended();
    }
  };

  const expandScreen = (e) => {
    const elem = e.target;

    if (elem.requestFullscreen) {
      elem.requestFullscreen();
    } else if (elem.mozRequestFullScreen) {
      /* Firefox */
      elem.mozRequestFullScreen();
    } else if (elem.webkitRequestFullscreen) {
      /* Chrome, Safari & Opera */
      elem.webkitRequestFullscreen();
    } else if (elem.msRequestFullscreen) {
      /* IE/Edge */
      elem.msRequestFullscreen();
    }
  };

  // Buy Credits 
  const goToBuyCredits = () => {
    props.history.push("/buy-credits");
 }
  

  const clickBackground = () => {
    if (!showVideoDevices) return;

    setShowVideoDevices(false);
  };

  const clickCameraDevice = (event) => {
    if (
      event &&
      event.target &&
      event.target.dataset &&
      event.target.dataset.value
    ) {
      const deviceId = event.target.dataset.value;
      const enabledAudio =
        userVideoRef.current.srcObject.getAudioTracks()[0].enabled;

      navigator.mediaDevices
        .getUserMedia({ video: { deviceId }, audio: enabledAudio })
        .then((stream) => {
          const newStreamTrack = stream
            .getTracks()
            .find((track) => track.kind === "video");
          const oldStreamTrack = userStream.current
            .getTracks()
            .find((track) => track.kind === "video");

          userStream.current.removeTrack(oldStreamTrack);
          userStream.current.addTrack(newStreamTrack);

          peersRef.current.forEach(({ peer }) => {
            // replaceTrack (oldTrack, newTrack, oldStream);
            peer.replaceTrack(
              oldStreamTrack,
              newStreamTrack,
              userStream.current
            );
          });
        });
    }
  };

  return (
    <RoomContainer onClick={clickBackground}>
      <VideoAndBarContainer>
        {showText && <p onClick={() => {setShowText(false)}}>If Your video fails to load, please press the reset button in the bottom bar (X).</p>}
        <VideoContainer>
          {/* Current User Video */}
          <VideoBox
            className={`width-peer${peers.length > 8 ? '' : peers.length}`}
          >
            {userVideoAudio['localUser'].video ? null : (
              <UserName>{currentUser}</UserName>
            )}
            <MicIcon className={ userVideoAudio['localUser'].audio ? 'fas fa-microphone' : 'fas fa-microphone-slash'} />
            <FaIcon className="fas fa-expand" />
            <MyVideo
              onClick={expandScreen}
              ref={userVideoRef}
              muted
              autoPlay
              playInline
            ></MyVideo>
          </VideoBox>
          {/* Joined User Vidoe */}
          {peers &&
            peers.map((peer, index, arr) => createUserVideo(peer, index, arr))}
        </VideoContainer>
        <BottomBar
          clickScreenSharing={clickScreenSharing}
          clickChat={clickChat}
          clickUserList={clickUserList}
          clickCameraDevice={clickCameraDevice}
          goToBack={goToBack}
          reloadPage={reloadPage}
          toggleCameraAudio={toggleCameraAudio}
          userVideoAudio={userVideoAudio['localUser']}
          screenShare={screenShare}
          videoDevices={videoDevices}
          showVideoDevices={showVideoDevices}
          setShowVideoDevices={setShowVideoDevices}
          goToBuyCredits={goToBuyCredits}
          enabled={bottomBarButtonsEnabler}
          isHost={isHost}
          endMeetForAll={endMeetForAll}
          toggleRaiseHand={toggleRaiseHand}
          userList={userVideoAudio}
        />
      </VideoAndBarContainer>
      <Chat display={displayChatOrList} roomId={roomId} chatEnabled={chatEnabled} chatToggleForAll={chatToggleForAll} isHost={isHost} />
      <UserList display={displayChatOrList} roomId={roomId} isHost={isHost} userList={userVideoAudio} setUserList={setUserVideoAudio} />
    </RoomContainer>
  );
};

const RoomContainer = styled.div`
  display: flex;
  width: 100%;
  max-height: 100vh;
  flex-direction: row;
`;

const VideoContainer = styled.div`
  max-width: 100%;
  height: 92%;
  display: flex;
  flex-direction: row;
  justify-content: space-around;
  flex-wrap: wrap;
  align-items: center;
  padding: 15px;
  box-sizing: border-box;
  gap: 10px;
`;

const VideoAndBarContainer = styled.div`
  position: relative;
  width: 100%;
  height: 100vh;
`;

const MyVideo = styled.video``;

const VideoBox = styled.div`
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  > video {
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }

  :hover {
    > i {
      display: block;
    }
  }
`;

const UserName = styled.div`
  position: absolute;
  font-size: calc(20px + 5vmin);
  z-index: 1;
`;

const FaIcon = styled.i`
  display: none;
  position: absolute;
  right: 15px;
  top: 15px;
`;

const MicIcon = styled.i`
  display: none;
  position: absolute;
  right: 50px;
  top: 15px;
`;

export default Room;
