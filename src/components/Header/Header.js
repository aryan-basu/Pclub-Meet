import React from 'react';
import Clock from 'react-live-clock';
import './Header.css';
import Logo from '../assets/images/Logo.png';



const Header = () => {

    const d = new Date();
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const weeks = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

    return (
            <div className="header">
                <div className="time">
                    <Clock format={'hh:mm A'} ticking={true} className='clock' />
                    <p>{weeks[d.getDay()]}, {months[d.getMonth()]} {d.getDate()}, {d.getFullYear()}</p>
                </div>
                <div className="logos">

                    <img src={Logo} className='logo' />
                    <div className="line"></div>
                    <h1>Meetings</h1>
                </div>
            
            </div>
    );
}

export default Header;