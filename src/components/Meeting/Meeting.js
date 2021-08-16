import React, { useEffect, useRef, useState } from 'react';
import './Meeting.css'
import Peer from 'peerjs';
import { io } from 'socket.io-client';
import firebase from 'firebase';
import { useHistory, useLocation } from 'react-router-dom';
import { Input, InputAdornment, IconButton } from '@material-ui/core';
import SendIcon from '@material-ui/icons/Send';
const Meeting = (props) => {


    // const socket = io("https://pclub-meet-backend.herokuapp.com/"); //initializing socket 
    const socket = io("localhost:5000/"); //initializing socket 

    //firebase
    const history = useHistory();
    const location = useLocation();
    var user = firebase.auth().currentUser;
    if (user === null) {
        history.push('/');
    }
    //states
    const [peers, setPeers] = useState({})
    const [myId, setMyId] = useState('');
    const [stream, setStream] = useState();

    //setting up my video
    const videoGrid = useRef();
    const myVideo = document.createElement('video')
    myVideo.muted = true; //important

    let messages = useRef()
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
        history.push('/meetend');
    }
    //audio
    const handleAudioClick = () => {
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

    const initializePeerEvents = (myPeer, socket) => {

        myPeer.on('open', id => {
            setMyId(id);
            socket.emit('join-room', props.match.params.roomId, id)
        })

        myPeer.on('error', (err) => {
            console.log('peer-connection-error', err);
            myPeer.reconnect();
        })
    }

    const initializeSocketEvents = (socket) => {

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

    useEffect(() => {

        const myPeer = new Peer(undefined, { // initialzing my peer object
            // host: 'pclub-meet-backend.herokuapp.com',
            host: 'localhost',
            // port: '443',
            port: '5000',
            path: '/peerjs',
            secure: true
        })

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
                        connectToNewUser(userId, stream, myPeer)
                    }, 1000)
                }
            });

        })

        //socket.on('user-disconnected)
        initializeSocketEvents(socket);

        //myPeer.on('open')
        initializePeerEvents(myPeer, socket);

    }, [])


    // useEffect(() => {
    //     socket.on("message", (message, userid) => {
    //         const ans = message;
    //         let temp = messages;
    //         temp.push({
    //              userId: data.userId,
    //              username: data.username,
    //              text: ans,
    //         });
    //         setMessages([...temp]);
    //     });
    // }, [socket]);

    const addMessageElement = (message, userId) => {
        const msg = document.createElement('div')
        msg.innerHTML =
            `<article className="msg-container ${userId === myId ? "msg-self" : "msg-remote"}" id="msg-0">
                    <div className="msg-box">
                        <div className="flr">
                            <div className="messages">
                                <p className="msg" id="msg-1">
                                ${message}
                                </p>
                            </div>
                        </div>
                    </div>
                </article>`;
        // if(message.current)
        messages.current.append(msg);
    }


    const sendMessage = (myPeer, socket) => {

        socket.on("createMessage", (message, userId) => {
            addMessageElement(message, userId)

        });
    }

    const setMessageText = (event) => {
        setMessage(event.target.value)
    }

    return (

        <div class="main" >
            <div className="body" >
                <section className="chatbox">
                    <section className="chat-window">
                        <div useRef={messages}>
                            <article className="msg-container msg-self" id="msg-0">
                                <div className="msg-box">
                                    <div className="flr">
                                        <div className="messages">
                                            <p className="msg" id="msg-0">
                                                Lorem ipsum
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </article>
                        </div>
                    </section>
                    <form className="chat-input" >
                        <input
                            type="text"
                            autocomplete="off"
                            placeholder="Type a message..."
                            onChange={setMessageText}
                        />

                        <IconButton id='send' onClick={sendMessage}>
                            <SendIcon />
                        </IconButton>
                    </form>
                </section>
            </div >



            <div className="video-chat-area" >
                <div id="video-grid" ref={videoGrid} >

                </div>
            </div>

            <nav class="bottom-nav" >
                <div>
                    <i class="fas fa-hand-paper media-icon one" ></i>
                    <i class="fas fa-ellipsis-h media-icon two"></i>
                </div>
                <div class='mute'>
                    <i class="far fa-microphone media-icon three" onClick={handleAudioClick} ></i>
                    <i class="far fa-phone media-icon four" onClick={handleDisconnect}></i>
                    <i class="far fa-video media-icon five" onClick={handleVideoClick} ></i>
                </div>
                <div>
                    <i class="fas fa-user-friends media-icon six"></i>
                    <i class="far fa-comment-alt media-icon seven"></i>
                </div>
            </nav>

        </div >
    );
}

export default Meeting;
