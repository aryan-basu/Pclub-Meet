import React from 'react';
import './Home.css'
import InputAdornment from '@material-ui/core/InputAdornment'
import Button from '@material-ui/core/Button'
import { RiAddBoxLine } from 'react-icons/ri'
import { useHistory } from 'react-router-dom';
import firebase from 'firebase';
import Header from '../Header/Header';
import ArrowForwardIcon from '@material-ui/icons/ArrowForward';

const Home = (props) => {

    const history = useHistory();
    let textInput = React.createRef();
    var user = firebase.auth().currentUser;
    var fullname;
    if(user == null) {
        history.push("/");
    }

    if (user !== null) {
        fullname = user.displayName.split(' ')[0];
       
    }
    async function handleLogout() {
        await firebase.auth().signOut();
        history.push("/");
    };

    const handleNewMeet = () => { // Creating a meeting

        history.push({
            pathname: '/preview',
            state: {
                isInitiator: true
            }
        })
    }


    const handlejoin = () => {  // joining a meeting
        const code = textInput.current.value;
        if (code != null) {
            history.push({
                pathname: '/preview',
                state: {
                    isInitiator: false,
                    roomId: code
                }
            })
        }
    }
    return (
        <div>
            <Header />
            <div className="home">
                <h2>Welcome {fullname} !</h2>
                <div className="entermeeting">
                    <input className="home-input" type="text" ref={textInput} placeholder="Enter Meeting code"></input>
                    <Button onClick={handlejoin} className="btn"><ArrowForwardIcon /></Button>
                </div>
                <div className='lines'>
                    <div className='line-1'></div>
                    <p>or</p>
                    <div className='line-1'></div>
                </div>

                <Button onClick={handleNewMeet} fullWidth={true} className='btn-meet'>
                    <InputAdornment>
                        <RiAddBoxLine className='btn-icon' />
                    </InputAdornment>
                    New Meet
                </Button>
                <Button onClick={handleLogout} className='btn mt-2'>Sign out</Button>
            </div>
        </div>
    );
}

export default Home;