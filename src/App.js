import React from 'react';
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";

import Signin from './components/Login/Signin'
import Signup from './components/Signup/Signup';
import Meetend from './components/Meetend/Meetend';
import Meeting from './components/Meeting/Meeting';
import Preview from './components/Preview/Preview';
import Home from './components/Home/Home'
import {auth,createUserProfileDocument, } from './firebase/firebase.utils';
import ForgotPassword from './components/ForgotPassword/ForgotPassword';

class App extends React.Component{
  constructor(){
    super();
    this.state={
      currentUser:null
    }
  }
  unsubscribeFromAuth = null
  componentDidMount(){
    this.unsubscribeFromAuth=auth.onAuthStateChanged(async userAuth=>{

    
     if(userAuth){
      const userRef=await createUserProfileDocument(userAuth);


       userRef.onSnapshot(onSnapshot=>{

        this.setState({
          currentUser:{
            id:onSnapshot.id,
            ...onSnapshot.data()

          }
        });
   

       });

     }
     else{
      this.setState({currentUser:userAuth}) ;
     }


    });
  }

  componentWillUnmount(){
    this.unsubscribeFromAuth();
  }
  render(){

    
  return (
  
      <Router>
        <Switch>
          <Route path='/' exact component={Signin} />
          <Route path='/signin' exact component={Signin} />
          <Route path='/signup' exact component={Signup} />
          <Route path='/meetend' exact component={Meetend} />
          <Route path='/home' exact component={Home} />
          <Route path='/meeting/:roomId' exact component={Meeting} />
          <Route path='/preview' exact component={Preview} />
          <Route path='/forgotPassword' exact component={ForgotPassword} />
        </Switch>
      </Router>
    
  );
  }
}

export default App;