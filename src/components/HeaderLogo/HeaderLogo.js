/* Primarily Made for meetend page */

import MeetendLogo from '../assets/images/Logo.png';
import "./HeaderLogo.css"

const HeaderLogo = () => {
    return (
        <div className="meetend-header">
            <div className="meetend-logos">
                <img src={MeetendLogo} className='meetend-logo-img' />
                <div className="meetend-line"></div>
                <h1>Meetings</h1>
            </div>
        </div>
    );
}

export default HeaderLogo;