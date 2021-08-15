import React from 'react';
import Button from '@material-ui/core/Button'
import '../Home/Home.css'
import Header from '../Header/Header';
import { useHistory, useLocation } from 'react-router-dom';
const Meetend = () => {
    const history = useHistory();
    const handleback=()=>{
        history.push('/');
      }
    return (
        <div>
            <Header/>
        <div className="home">
            <h1>You left the meeting.</h1>
            
            <button classname="input-btn" onClick={handleback}>Back To Home screen</button>
          
        </div>
        </div>
    );
}

export default Meetend;
