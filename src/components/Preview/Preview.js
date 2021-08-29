  
import React, { useEffect, useState, useRef } from 'react';
import Card from '@material-ui/core/Card'
import './Preview.css'
import CardContent from '@material-ui/core/CardContent'
import CardActions from '@material-ui/core/CardActions'
import IconButton from '@material-ui/core/IconButton'
import Input from '@material-ui/core/Input'
import InputAdornment from '@material-ui/core/InputAdornment'
import { IoCopySharp } from 'react-icons/io5'
import Button from '@material-ui/core/Button'
import Axios from 'axios';
import { useHistory, useLocation } from 'react-router-dom';
import firebase from 'firebase';
import Header from '../Header/Header';



const Preview = (props) => {

    //states & ref's
    const history = useHistory();
    const location = useLocation();
    const [roomId, setroomId] = useState('');
    const myVideo = useRef()
    const [stream, setStream] = useState();
    const [audioState, setAudioState] = useState(true);
    const [videoState, setVideoState] = useState(true);
    const [isVideo, setIsVideo] = useState(true);
    const [isMic, setIsMic] = useState(true);


    //firebase
    // var user = firebase.auth().currentUser;
    firebase.auth().onAuthStateChanged(function (user) {

        if (user) {
            //Here you can place the code that you want to run if the user is logged in
        } else {
            history.push('/');
        }

    });

    //audio
    const handleAudioClick = () => {
        setIsMic(!isMic);
        const enabled = stream.getAudioTracks()[0].enabled;
        if (enabled) {
            stream.getAudioTracks()[0].enabled = false;
            setAudioState(false)
        }
        else {
            stream.getAudioTracks()[0].enabled = true;
            setAudioState(true)
        }
    }

    //video
    const handleVideoClick = () => {
        setIsVideo(!isVideo);
        const enabled = stream.getVideoTracks()[0].enabled;
        if (enabled) {
            stream.getVideoTracks()[0].enabled = false;
            setVideoState(false)
        }
        else {
            stream.getVideoTracks()[0].enabled = true;
            setVideoState(true)
        }
    }

    //initial mounting
    useEffect(() => {

        navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true
        }).then(stream => {
            setStream(stream)
            if (myVideo.current) {
                myVideo.current.srcObject = stream
            }
        })


        if (location.state.isInitiator) {

            Axios.get('https://pclub-meet-backend.herokuapp.com/join').then(res => {
                setroomId(res.data.link)
                const inputLink = document.getElementById('input-with-icon-adornment text')
                inputLink.value = res.data.link
            })
            .catch((err) => console.log(err))
        }

        else {
            setroomId(location.state.roomId)
            const inputLink = document.getElementById('input-with-icon-adornment text')
            inputLink.value = location.state.roomId
        }
    }, []); 

    //handle button join
    const handleJoin = () => {

        stream.getTracks().forEach(track => track.stop());

        const newPath = '/meeting/' + roomId

        history.push({
            pathname: newPath,
            state: {
                currentAudioState: audioState,
                currentVideoState: videoState
            }
        })
    }

    return (
        <div>
            <Header />
            <div className="preview-main">
                <Card className='card'>
                    <CardContent className='video'>
                        <video autoPlay muted ref={myVideo} />
                    </CardContent>
                    <CardActions className='card-buttons'>
                        <i onClick={handleAudioClick} className={`${isMic ? 'far fa-microphone media-icon three' : 'far fa-microphone-slash media-icon three'}`} ></i>
                        <i onClick={handleVideoClick} className={`${isVideo ? 'far fa-video media-icon five' : 'far fa-video-slash media-icon five'}`}></i>
                    </CardActions>
                </Card>
                <div className='join'>
                    <Input
                        className='join-input'
                        placeholder='Some text to copy'
                        label="Filled" variant="filled"
                        id="input-with-icon-adornment text"
                        endAdornment={
                            <InputAdornment position="end" >
                                <IconButton onClick={() => { navigator.clipboard.writeText(roomId) }} >
                                    <IoCopySharp />
                                </IconButton>
                            </InputAdornment>
                        }
                    />
                    <Button onClick={handleJoin} className='join-btn'>Join Meet</Button>
                </div>
            </div>
        </div>
    );
}

export default Preview;
