import React from 'react';
import { FormControl } from '@material-ui/core';
import Input from '@material-ui/core/Input';
import InputAdornment from '@material-ui/core/InputAdornment';
import PersonIcon from '@material-ui/icons/Person';
import VpnKeyIcon from '@material-ui/icons/VpnKey';
import Button from '@material-ui/core/Button'
import Email from '@material-ui/icons/Email'

import './Signup.css'

import Header from '../Header/Header';
import { auth, createUserProfileDocument } from '../../firebase/firebase.utils';
import { withRouter } from 'react-router-dom';
class Signup extends React.Component {
    constructor() {
        super();
        this.state = {
            displayName: '',
            email: '',
            password: '',
            confirmPassword: '',
        }
    }
    handleSubmit = async event => {
        event.preventDefault();
        const { history } = this.props;
        const { displayName, email, password, confirmPassword } = this.state;
        if (password !== confirmPassword) {

                 window.alert("password don't match");
            return;
        }
        try {
            const { user } = await auth.createUserWithEmailAndPassword(email, password);

            await user.updateProfile({
                displayName: displayName
            });

            await createUserProfileDocument(user, { displayName });
            this.setState({
                displayName: '',
                email: '',
                password: '',
                confirmPassword: '',
            })
            history.push('/home');
        }
        catch (error) {

        window.alert(`${error}`);
        }
    };
    handleChange = event => {
        const { name, value } = event.target;
        this.setState({ [name]: value });
    };

    handleShowPassword = () => {
        var y = document.getElementById("signUpPassword");
        if(y.getAttribute("type") === "password") {
            y.setAttribute("type", "text");
        }
        else {
            y.setAttribute("type", "password")
        }
    }

    handleShowConfirmPassword = () => {
        var y = document.getElementById("signUpConfirmPassword");
        if(y.getAttribute("type") === "password") {
            y.setAttribute("type", "text");
        }
        else {
            y.setAttribute("type", "password")
        }
    }

    render() {
        const { displayName, email, password, confirmPassword } = this.state;
        return (
            <div>
                <Header currentUser={this.state.currentUser} />

                <div className="signup-card">
                    <h2>Sign Up</h2>
                    <FormControl className='signup-form' onSubmit={this.handleSubmit} autoComplete="off">

                        <form onSubmit={this.handleSubmit}>
                            <Input
                                required
                                className='input'
                                name='displayName'
                                value={displayName}
                                onChange={this.handleChange}
                                placeholder='Full name'
                                label="Filled" variant="filled"
                                id="input-with-icon-adornment"
                                startAdornment={
                                    <InputAdornment position="start" className='icons'>
                                        <PersonIcon />
                                    </InputAdornment>
                                }
                            />
                            <Input
                                className='input'
                                name='email'
                                value={email}
                                onChange={this.handleChange}
                                placeholder='Email'
                                label="Filled" variant="filled"
                                id="input-with-icon-adornment"
                                startAdornment={
                                    <InputAdornment position="start" className='icons'>
                                        <Email />
                                    </InputAdornment>
                                }
                            />
                            <Input
                                className='input'
                                placeholder='Password'
                                name='password'
                                type='password'
                                id='signUpPassword'
                                value={password}
                                onChange={this.handleChange}
                                label="Filled" variant="filled"
                                // id="input-with-icon-adornment"
                                startAdornment={
                                    <InputAdornment position="start" className='icons'>
                                        <VpnKeyIcon />
                                    </InputAdornment>
                                }
                                endAdornment={
                                    <InputAdornment position="start" className='icons'>
                                        <i class="far fa-eye" id="togglePassword" onClick={this.handleShowPassword}></i>
                                    </InputAdornment>
                                }
                            />

                            <Input
                                className='input'
                                type='password'
                                name='confirmPassword'
                                id='signUpConfirmPassword'
                                value={confirmPassword}
                                onChange={this.handleChange}
                                placeholder='Confirm Password'
                                label="Filled" variant="filled"
                                // id="input-with-icon-adornment"
                                startAdornment={
                                    <InputAdornment position="start" className='icons'>
                                        <VpnKeyIcon />
                                    </InputAdornment>
                                }
                                endAdornment={
                                    <InputAdornment position="start" className='icons'>
                                        <i class="far fa-eye" id="togglePassword" onClick={this.handleShowConfirmPassword}></i>
                                    </InputAdornment>
                                }
                            />
                            <Button variant="contained" type='submit' className='btn'>Signup</Button>
                        </form>
                        <p className='signup'>Already have an account, {" "}
                            <a
                                className='text-success'
                                href='Signin'>Signin</a>
                        </p>
                    </FormControl>
                </div>
            </div>
        );
    }
}

export default withRouter(Signup);
