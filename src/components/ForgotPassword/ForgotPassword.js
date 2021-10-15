import Input from '@material-ui/core/Input';
import Button from '@material-ui/core/Button';
import { Link } from 'react-router-dom';
import { useState } from "react"
import "./ForgotPassword.css"
import { useHistory } from 'react-router-dom';
import Logo from '../HeaderLogo/HeaderLogo';
import SuccessMessage from "../SuccessMessage/SuccessMessage"

import firebase from 'firebase';


const ForgotPassword = () => {
    const user = firebase.auth().currentUser;
    const [reset_complete, setResetComplete] = useState(false); 
   
    let history = useHistory();
    if(user) {
        history.push("/home");
    }
    const [email, setEmail] = useState("");

    const handleSubmit = (e) => {
        firebase.auth().sendPasswordResetEmail(email);      
        setResetComplete(true);
    }

    return (
        <div>
            <Logo />
            <div className="forgotpassword-container">
                <div className="forgotpassword-header">
                    Forgot Your Password?
                </div>
                <p>Enter the email you used while sign up</p>
                {reset_complete && <SuccessMessage>{"Reset Password Link has been sent to your Email."}</SuccessMessage>}  
                <Input
                    className='input'
                    type='text'
                    label="Filled"
                    variant="filled"
                    placeholder="Email"
                    onChange={(e) => setEmail(e.target.value)}
                    fullWidth />
                <div className="button-alignment">
                    <Button
                        variant="contained"
                        type='submit'
                        className='btn'
                        id="forgotButton"
                        onClick={handleSubmit}
                        fullWidth >
                        Reset Password
                    </Button>
                </div>
                <div className="backtosignin">
                    <Link to="/">Back to sign in</Link>
                </div>
            </div>
        </div>
    );
}

export default ForgotPassword;
