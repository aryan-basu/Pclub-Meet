import React, { useEffect, useRef, useState } from 'react';
import './Meeting.css'
import Peer from 'peerjs';
import { io } from 'socket.io-client';
import firebase from 'firebase';
import { useHistory, useLocation } from 'react-router-dom';
import { IconButton } from '@material-ui/core';
import SendIcon from '@material-ui/icons/Send';

const socket = io("https://pclub-meet-backend.herokuapp.com/");//initializing socket (important)

const Meeting = (props) => {

    const myPeer = new Peer(undefined, { // initialzing my peer object
        host: 'pclub-meet-backend.herokuapp.com',
        port: '443',
        path: '/peerjs',
        secure: true
    })

    //firebase
    const history = useHistory();
    const location = useLocation();
    // var user = firebase.auth().currentUser;
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

    const [peers, setPeers] = useState({})

    const [myId, setMyId] = useState('');
    const [stream, setStream] = useState();

    //setting up my video
    const videoGrid = useRef();
    const myVideo = document.createElement('video')
    myVideo.muted = true; //important

    const messages = useRef()
    const [message, setMessage] = useState("")

    //helper function to add stream to video element
    const addVideoStream = (video, stream) => {
        video.srcObject = stream
        video.addEventListener('loadedmetadata', () => { //alert
            video.play()
        })
        if (videoGrid.current) {
            videoGrid.current.append(video);
        }
    }

    const handleDisconnect = () => {
        
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

    const connectToNewUser = (userId, stream) => {
        const call = myPeer.call(userId, stream)
        const video = document.createElement('video')//don't mute this
        call.on('stream', userVideoStream => {
            addVideoStream(video, userVideoStream)
        })
        call.on('close', () => {
            video.remove()
        })

        peers[userId] = call
    }

    const initializePeerEvents = () => {

        myPeer.on('open', id => {
            setMyId(id);
            socket.emit('join-room', props.match.params.roomId, id)
        })

        myPeer.on('error', (err) => {
            console.log('peer-connection-error', err);
            myPeer.reconnect();
        })
    }

    const initializeSocketEvents = () => {

        socket.on('connect', () => {
            console.log('socket-connected');
        })

        socket.on('user-disconnected', userId => {
            if (peers[userId]) {
                peers[userId].close()
            }
        })

        socket.on('disconnect', () => {
            console.log('socket-disconnected');
        })

        socket.on('error', () => {
            console.log('socket-error');
        })
    }

    const handleEnterKey = (e) => {
        // console.log(e, message)
        if (e.key === "Enter" && message.length !== 0) {
            socket.emit("message", message)
            setMessage("")
        }
    };

    useEffect(() => {

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
                    addVideoStream(video, userVideoStream)
                })

                call.on('close', () => {
                    video.remove()
                })
            })

            socket.on('user-connected', userId => {
                if (userId !== myId) {
                    // user is joining
                    setTimeout(() => {
                        // user joined
                        connectToNewUser(userId, stream)
                    }, 1000)
                }
            });

            socket.on("createMessage", (message, userId) => {
                if (message !== "") {
                    setTimeout(() => {
                        addMessageElement(message, userId, myId)
                    }, 1000)
                }
            });

        })

        //socket.on('user-disconnected)
        initializeSocketEvents();

        //myPeer.on('open')
        initializePeerEvents();

    }, [])

    const addMessageElement = (message, userId, id) => {
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

    const sendMessage = () => {
        if (message !== null)
            socket.emit("message", message, myId)
        setMessage("")
    }

    const setMessageText = (event) => {
        setMessage(event.target.value)
    }

    return (

        <div className="main" >
            <div className="body" >
                <section className="chatbox">
                    <section className="chat-window">
                        <div ref={messages}>

                        </div>
                    </section>
                    <div className="chat-input" >
                        <input
                            type="text"
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