import React, { useEffect, useRef, useState } from 'react';
import './Meeting.css'
import Peer from 'peerjs';
import { io } from 'socket.io-client';
import firebase from 'firebase';
import { useHistory, useLocation } from 'react-router-dom';
import { IconButton } from '@material-ui/core';
import SendIcon from '@material-ui/icons/Send';

const socket = io("http://localhost:5000/");//initializing socket (important)

const Meeting = (props) => {

    //const videoContainer = {};
 
  //console.log(roomname);


//to get the number of clients in this room


    //firebase
    const roomId=props.match.params.roomId;
    
    const history = useHistory();
    const location = useLocation();
    var abc = firebase.auth().currentUser;
    firebase.auth().onAuthStateChanged(function (user) {

        if (user) {
            //Here you can place the code that you want to run if the user is logged in
        } else {
            history.push('/');
        }

    });
    //states
    const [isVideo, setIsVideo] = useState(location.state.currentVideoState);
    const [isMic, setIsMic] = useState(location.state.currentAudioState);
    const[count,setCount]=useState(0);
    const [peers, setPeers] = useState({})

    let myId = '';
    const [stream, setStream] = useState();
    const [myPeer, setMyPeer] = useState();

    //setting up my video
    const videoGrid = useRef();
    const myVideo = document.createElement('video')
    myVideo.muted = true; //important

    const messages = useRef()
    const [message, setMessage] = useState("")

    //helper function to add stream to video element
    const addVideoStream = (video, stream, id) => {

        video.srcObject = stream
        video.id = id
        video.addEventListener('loadedmetadata', () => { //alert
            video.play()
        })
        if (videoGrid.current) {
            videoGrid.current.append(video);
        }
    }

    //audio
    const handleAudioClick = () => {

        setIsMic(!isMic);
        const enabled = stream.getAudioTracks()[0].enabled;
        if (enabled) {
            stream.getAudioTracks()[0].enabled = false;
            console.log('mic disabled')
            //render html
        }
        else {
            stream.getAudioTracks()[0].enabled = true;
            console.log('mic enabled')
            //render html
        }
    }

    //video
    const handleVideoClick = () => {
        setIsVideo(!isVideo);
        const enabled = stream.getVideoTracks()[0].enabled;
        if (enabled) {
            stream.getVideoTracks()[0].enabled = false;
            //render html
        }
        else {
            stream.getVideoTracks()[0].enabled = true;
            //render html
        }
    }

    const connectToNewUser = (userId, stream, myPeer) => {
        //console.log(myId);
        const call = myPeer.call(userId, stream, { metadata: { id: myId } });
        const video = document.createElement('video')//don't mute this
        call.on('stream', userVideoStream => {
            addVideoStream(video, userVideoStream, userId)
        })
        call.on('close', () => {
            console.log("connect to user id" + userId)
            removeVideo(userId)
        })
        call.on('error', () => {
            console.log('peer error ------')
            removeVideo(userId);
        })

        peers[userId] = call
    }
    const username=abc.displayName;
    const initializePeerEvents = (myPeer) => {

        myPeer.on('open', id => {
            myId = id
            myVideo.id = id
            //console.log(myId)
           
           // socket.emit('join-room', props.match.params.roomId, id)
        })

        myPeer.on('error', (err) => {
            console.log('peer-connection-error', err);
            myPeer.reconnect();
        })
    }
   
    socket.emit('joinRoom', { username, roomId });
 
    const initializeSocketEvents = () => {

       
        socket.on('connect', () => {
            setCount(count+1);
            console.log(count);
            console.log('socket-connected');
            //console.log(count);
        })

        socket.on('user-disconnected', userId => {
            if (peers[userId]) {
                peers[userId].close()
            }
            console.log("socket userid " + userId)
            removeVideo(userId);
            setCount(count-1);
            console.log(count);
        })

        socket.on('disconnect', () => {
            console.log('socket-disconnected');
        })

        socket.on('error', () => {
            console.log('socket-error');
        })
       
          //console.log(roomname);
         
    }
/*
    const handleEnterKey = (e) => {
        // console.log(e, message)
        if (e.key === "Enter" && message.length !== 0) {
            socket.emit("message", message)
            setMessage("")
        }
    };
*/
    const removeVideo = (id) => {
        const video = document.getElementById(id);
        if (video) video.remove();
    }

    const handleDisconnect = () => {
        // const myMediaTracks = videoContainer[myId].getTracks();
        // myMediaTracks?.forEach((track) => {
        //     track.stop();
        // })
        socket.disconnect();
        myPeer.destroy();
        history.push('/meetend')
    }

    useEffect(() => {

        const myPeer = new Peer(undefined, { // initialzing my peer object
            host: 'localhost',
            port: '5000',
            path: '/peerjs',
          
        })

        setMyPeer(myPeer)

        initializeSocketEvents();

        initializePeerEvents(myPeer);

        navigator.mediaDevices.getUserMedia({
            audio: true,
            video: true,
        }).then(stream => {

            stream.getAudioTracks()[0].enabled = location.state.currentAudioState;
            stream.getVideoTracks()[0].enabled = location.state.currentVideoState;

            setStream(stream)
            addVideoStream(myVideo, stream)

            myPeer.on('call', call => {
                call.answer(stream)
                const video = document.createElement('video') //don't mute this

                call.on('stream', userVideoStream => {
                    addVideoStream(video, userVideoStream, call.metadata.id)
                })

                call.on('close', () => {
                    console.log("on close id : " + call.metadata.id);
                    removeVideo(call.metadata.id)
                })

                call.on('error', () => {
                    console.log('peer error ------');
                    removeVideo(call.metadata.id);
                });

                peers[call.metadata.id] = call;
            });
           // Get room and users
           socket.on('roomUsers', ({ roomId, users }) => {
            //  outputRoomName(room);
              //outputUsers(users);
              console.log(users);
              //console.log(roomId);
            });
  
            socket.on('user-connected', userId => {
                console.log(userId);
                if (userId !== myId) {
                    // user is joining
                    // setTimeout(() => {
                    //     // user joined
                        
                    // }, 1000)
                    connectToNewUser(userId, stream, myPeer)
                }
            });

            socket.on('newmsg', function (data) {
                // client side data fetch
                console.log(data.user, data.message);
                const msg = document.createElement('div')
                msg.innerHTML =
                    `<article class="msg-container msg-remote" id="msg-0">
                              <div class="msg-box">
                                  <div class="flr">
                                      <div class="messages">
                                          <p class="msg" id="msg-1">
                                          ${data.user}: ${data.message}
                                          </p>
                                      </div>
                                  </div>
                              </div>
                          </article>`;
                messages.current.append(msg);

            });
        })

    }, [])

   /* const addMessageElement = (message, userId, id) => {
        console.log(id, userId)
        const msg = document.createElement('div')
        msg.innerHTML =
            `<article class="msg-container ${userId === myId ? "msg-self" : "msg-remote"}" id="msg-0">
                    <div class="msg-box">
                        <div class="flr">
                            <div class="messages">
                                <p class="msg" id="msg-1">
                                ${userId}: ${message}
                                </p>
                            </div>
                        </div>
                    </div>
                </article>`;
        // if(message.current)
        messages.current.append(msg);
    }
 
    */

/*
    const setMessageText = (event) => {
        setMessage(event.target.value)
    } */

    function sendMessage() {
        // var msg = document.getElementById('message').value;
        // console.log(msg);
        if (message) {
            socket.emit('msg', { message, user: abc.displayName });
            setMessage("")
        }
    }
    const handleEnterKey = (e) => {
        // var msg = document.getElementById('message').value;
        if (e.key === "Enter" && message.length !== 0) {
            socket.emit('msg', { message, user: abc.displayName });
            setMessage("")
        }
    };
    const setMessageText = (event) => {
        setMessage(event.target.value)
    }

    return (

        <div className="main" >
            <div className="body" >
                <section className="chatbox">
                    <h2 className="chatname">Chat</h2>
                    <section className="chat-window">
                        <div ref={messages}>

                        </div>
                    </section>
                    <div className="chat-input" >
                        <input
                            type="text"
                            // id='message'
                            autoComplete="off"
                            placeholder="Type a message..."
                            onChange={setMessageText}
                            value={message}
                            onKeyPress={handleEnterKey}
                        />

                        <IconButton id='send' onClick={sendMessage}>
                            <SendIcon />
                        </IconButton>
                    </div>
                </section>
            </div >

            <div className="video-chat-area" >
                <div id="video-grid" ref={videoGrid} >

                </div>
            </div>

            <nav className="bottom-nav" >
                <div>
                    <i className="fas fa-hand-paper media-icon one" ></i>
                    <i className="fas fa-ellipsis-h media-icon two"></i>
                </div>
                <div className='mute'>
                    <i onClick={handleAudioClick} className={`${isMic ? 'far fa-microphone media-icon three' : 'far fa-microphone-slash media-icon three'}`} ></i>

                    <i className="far fa-phone media-icon four" onClick={handleDisconnect}></i>
                    <i onClick={handleVideoClick} className={`${isVideo ? 'far fa-video media-icon five' : 'far fa-video-slash media-icon five'}`}></i>

                </div>
                <div>
                    <i className="fas fa-user-friends media-icon six"></i>
                    <i className="far fa-comment-alt media-icon seven"></i>
                </div>
            </nav>

        </div>
    );

}

export default Meeting;
