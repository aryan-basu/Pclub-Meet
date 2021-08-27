import Input from '@material-ui/core/Input';
import Button from '@material-ui/core/Button';
import { Link } from 'react-router-dom';
import { useState } from "react"
import "./ForgotPassword.css"

const ForgotPassword = () => {
    const [email, setEmail] = useState("");

    const handleSubmit = (e) => {
        console.log(email);
    }

    return (
        <div className="forgotpassword-container">
            <div className="forgotpassword-header">
                Forgot Your Password?
            </div>
            <p>Enter the email you used while sign up</p>
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
    );
}

export default ForgotPassword;