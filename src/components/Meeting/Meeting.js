import React, { useEffect, useRef, useState } from 'react';
import './Meeting.css'
import Peer from 'peerjs';
import { io } from 'socket.io-client';
import firebase from 'firebase';
import { useHistory, useLocation } from 'react-router-dom';
import { IconButton } from '@material-ui/core';
import SendIcon from '@material-ui/icons/Send';
import useMediaQuery from '@material-ui/core/useMediaQuery';

const socket = io("https://pclub-meet-backend.herokuapp.com/");

const Meeting = (props) => {

    //const videoContainer = {};

    //console.log(roomname);


    //to get the number of clients in this room


    //firebase
    const roomId = props.match.params.roomId;

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
    const [count, setCount] = useState(0);
    const [peers, setPeers] = useState({})
    const users = [];
    let myId = '';
    const [stream, setStream] = useState();
    const [myPeer, setMyPeer] = useState();

    //setting up my video
    const videoGrid = useRef();
    const myVideo = document.createElement('video')
    myVideo.muted = true; //important

    const messages = useRef()
    const [message, setMessage] = useState("")

    const matches = useMediaQuery('(max-width:800px)');

    //helper function to add stream to video element
    const addVideoStream = (video, stream, id, name) => {


        const index = users.findIndex(user => user.id === id);
        if (index === -1 || id == undefined) {

            const user = { id, name }
            users.push(user);


            //  console.log(name);
            video.srcObject = stream;
            //video.id=id;

            video.addEventListener("loadedmetadata", () => {
                video.play();
            });

            if (videoGrid.current) {
                const videoWrapper = document.createElement("div");
                videoWrapper.id = id;
                videoWrapper.classList.add("video-wrapper");

                // peer name
                const namePara = document.createElement("p");
                if (name === undefined)
                    name = abc.displayName;
                namePara.innerHTML = name;
                namePara.classList.add("video-element");
                namePara.classList.add("name");

                const elementsWrapper = document.createElement("div");
                elementsWrapper.classList.add("elements-wrapper");


                elementsWrapper.appendChild(namePara);
                videoWrapper.appendChild(elementsWrapper);
                videoWrapper.appendChild(video);
                videoGrid.current.append(videoWrapper);
            }
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
            firebase.firestore().collection(`${roomId}`).doc(`${userId}`).get().then((doc) => {
                if (doc.exists) {

                    const name = doc.data().username;
                    // Use a City instance method
                    addVideoStream(video, userVideoStream, userId, name)

                } else {
                    console.log("No such document!");
                }
            }).catch((error) => {
                console.log("Error getting document:", error);
            });
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
    const username = abc.displayName;
    const initializePeerEvents = (myPeer) => {

        myPeer.on('open', id => {
            myId = id
            myVideo.id = id
            //console.log(myId)

            socket.emit('join-room', props.match.params.roomId, id, abc.displayName)
        })

        myPeer.on('error', (err) => {
            console.log('peer-connection-error', err);
            myPeer.reconnect();
        })
    }

    socket.emit('joinRoom', { username, roomId });

    const initializeSocketEvents = () => {


        socket.on('connect', () => {
            setCount(count + 1);
            console.log(count);
            console.log('socket-connected');
            //console.log(count);
        })

        socket.on('user-disconnected', userId => {
            if (peers[userId]) {
                firebase.firestore().collection(`${roomId}`).doc(`${userId}`).delete();
                peers[userId].close()
            }
            console.log("socket userid " + userId)
            removeVideo(userId);
            setCount(count - 1);
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
            host: 'pclub-meet-backend.herokuapp.com',
            port: '443',
            path: '/peerjs',
            secure: true
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
                    firebase.firestore().collection(`${roomId}`).doc(`${call.metadata.id}`).get().then((doc) => {
                        if (doc.exists) {

                            const name = doc.data().username;
                            addVideoStream(video, userVideoStream, call.metadata.id, name)
                            // Use a City instance method

                        } else {
                            console.log("No such document!");
                        }
                    }).catch((error) => {
                        console.log("Error getting document:", error);
                    });
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
            const userList = document.getElementById('users');
            socket.on('roomUsers', ({ roomId, users }) => {
                //  outputRoomName(room);
                //outputUsers(users);
                //console.log(users);
                //console.log(roomId);
                userList.innerHTML = '';
                users.forEach((user) => {
                    const li = document.createElement('li');
                    li.innerText = user.username;
                    userList.appendChild(li);
                });
            });




            socket.on('user-connected', userId => {
                //console.log(userId);
                if (userId !== myId) {
                    // user is joining
                    // setTimeout(() => {
                    //     // user joined

                    // }, 1000)
                    //connectToNewUser(userId, stream, myPeer)
                    setTimeout(() => {
                        // user joined
                        connectToNewUser(userId, stream, myPeer)
                    }, 1000)
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
    function handlesection() {
        const participantid = document.getElementById('participant');
        const partname = document.getElementById('partname');
        partname.style.display = 'block';
        participantid.style.display = "block";
        const participantwindow = document.getElementById('participant-window');
        participantwindow.style.display = 'block';
        const chatboxid = document.getElementById('chatbox');
        chatboxid.style.display = 'none';
        const chatinputid = document.getElementById('chat-input');
        chatinputid.style.display = 'none'
    }
    function handlechat() {

        const participantid = document.getElementById('participant');
        const partname = document.getElementById('partname');
        partname.style.display = 'none';
        participantid.style.display = "none";
        const participantwindow = document.getElementById('participant-window');
        participantwindow.style.display = 'none';
        const chatboxid = document.getElementById('chatbox');
        chatboxid.style.display = 'block';
        const chatinputid = document.getElementById('chat-input');
        chatinputid.style.display = 'flex'
    }

    const handleSidebar = () => {
        var x = document.getElementById("chatbox-container");
        var y = document.getElementById("meeting-body");
        if (x.style.display === "none") {
            x.style.display = "flex";
        }
        else {
            x.style.display = "none";
        }
        if (matches && y.style.display === "block") {
            y.style.display = "none";
        }
        else {
            y.style.display = "block";
        }
    }
    return (

        <div className="meeting-container" >
            <div className="meeting-main">
                <div id="meeting-body">
                    <div className="video-area" >
                        <div id="video-grid" ref={videoGrid} >

                        </div>
                    </div>

                    <div className="bottom-nav" >
                        <div className="bottom-left">
                            <i className="fas fa-hand-paper media-icon one" ></i>
                            <i className="fas fa-ellipsis-h media-icon two" onClick={handleSidebar}></i>
                        </div>
                        <div className="bottom-mid">
                            <i onClick={handleAudioClick} className={`${isMic ? 'far fa-microphone media-icon three' : 'far fa-microphone-slash media-icon three'}`} ></i>
                            <i className="far fa-phone media-icon four" onClick={handleDisconnect}></i>
                            <i onClick={handleVideoClick} className={`${isVideo ? 'far fa-video media-icon five' : 'far fa-video-slash media-icon five'}`}></i>
                        </div>
                        <div className="bottom-right">
                            <i className="fas fa-user-friends media-icon six" onClick={handlesection}></i>
                            <i className="far fa-comment-alt media-icon seven" onClick={handlechat}></i>
                        </div>
                    </div>
                </div>
                <div id="chatbox-container" >
                    <div id="participant">
                        <div className="participant-container">
                            <h2 id="partname">Participants</h2>
                            <i className="fa fa-times" aria-hidden="true" onClick={handleSidebar}></i>
                        </div>
                        <div id="participant-window">
                            <ul id="users"></ul>
                        </div>
                    </div>
                    <div id="chatbox">
                        <div className="chatname-container">
                            <h2 className="chatname">Chat</h2>
                            <i className="fa fa-times" aria-hidden="true" onClick={handleSidebar}></i>
                        </div>
                        <div className="chat-window">
                            <div ref={messages}>
                            </div>
                        </div>
                    </div>
                    <div id="chat-input" >
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
                </div >



            </div>
        </div>
        // <div className="meeting-container">
        //     <div className="meeting-main" >
        //         <div className="meeting-body" >
        //             <div className="video-area">
        //                 <div id="video-grid" ref={videoGrid} >

        //                 </div>
        //             </div>
        //             {matches && <div className="bottom-nav">
        //                 <div className="bottom-left">
        //                     <i className="fas fa-hand-paper media-icon one" ></i>
        //                     <i className="fas fa-ellipsis-h media-icon two" onClick={handleSidebar}></i>
        //                 </div>
        //                 <div className="bottom-mid">
        //                     <i onClick={handleAudioClick} className={`${isMic ? 'far fa-microphone media-icon three' : 'far fa-microphone-slash media-icon three'}`} ></i>

        //                     <i onClick={handleDisconnect} className="far fa-phone media-icon four" ></i>
        //                     <i onClick={handleVideoClick} className={`${isVideo ? 'far fa-video media-icon five' : 'far fa-video-slash media-icon five'}`}></i>
        //                 </div>
        //                 <div className="bottom-right">
        //                     <i className="fas fa-user-friends media-icon six"></i>
        //                     <i className="far fa-comment-alt media-icon seven"></i>
        //                 </div>
        //             </div>}
        //             {!sidebar && !matches && <div className="bottom-nav">
        //                 <div className="bottom-left">
        //                     <i className="fas fa-hand-paper media-icon one" ></i>
        //                     <i className="fas fa-ellipsis-h media-icon two" onClick={handleSidebar}></i>
        //                 </div>
        //                 <div className="bottom-mid">
        //                     <i onClick={handleAudioClick} className={`${isMic ? 'far fa-microphone media-icon three' : 'far fa-microphone-slash media-icon three'}`} ></i>

        //                     <i onClick={handleDisconnect} className="far fa-phone media-icon four" ></i>
        //                     <i onClick={handleVideoClick} className={`${isVideo ? 'far fa-video media-icon five' : 'far fa-video-slash media-icon five'}`}></i>
        //                 </div>
        //                 <div className="bottom-right">
        //                     <i className="fas fa-user-friends media-icon six"></i>
        //                     <i className="far fa-comment-alt media-icon seven"></i>
        //                 </div>
        //             </div>}
        //         </div>
        //         {sidebar && <div className="chatbox">
        //             <i className="fa fa-times" aria-hidden="true" onClick={handleSidebar}></i>
        //             <h2 className="chatname">Chat</h2>
        //             <section id="participant">
        //                 <h2 id="partname">Participants</h2>
        //                 <section id="participant-window"> <ul id="users"></ul></section>
        //             </section>
        //             <div ref={messages}>

        //             </div>
        //             <div className="chat-input" >
        //                 <input
        //                     type="text"
        //                     // id='message'
        //                     autoComplete="off"
        //                     placeholder="Type a message..."
        //                     onChange={setMessageText}
        //                     value={message}
        //                     onKeyPress={handleEnterKey}
        //                 />

        //                 <IconButton id='msg-send' onClick={sendMessage}>
        //                     <SendIcon />
        //                 </IconButton>
        //             </div>
        //         </div>}
        //     </div>
        // </div>
    );

}

export default Meeting;
