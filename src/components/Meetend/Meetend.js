import React from 'react';
import Button from '@material-ui/core/Button'
import '../Home/Home.css'
import { useHistory } from 'react-router-dom';
import './Meetend.css'
import Logo from '../HeaderLogo/HeaderLogo';
import firebase from 'firebase';
import { Redirect } from 'react-router-dom';

const Meetend = () => {
    let history = useHistory();
    const user = firebase.auth().currentUser;
    if (user) {
        
      } else {
        history.push("/");
      }
    const handleback = () => {
        history.push('/home');
    }
    return (
        <div>
            <Logo />
            <div className="meetend">
                <p>You left the meeting</p>
                <Button className="btn" onClick={handleback}>Back To Home screen</Button>
            </div>
        </div>
    );
}

export default Meetend;