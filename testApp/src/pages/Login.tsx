/*
* FILE:           Login.tsx
* PROJECT:        HeRVY
* FIRST VERSION:  April 10, 2020
* PROGRAMMER:     Emily Goodwin
* DESCRIPTION:    Contains the code for the Login page component. Renders the login page with Okta widget and authentication.
*/ 

import React, {Component} from 'react';
import { withAuth } from '@okta/okta-react';
import { Auth } from '../App';
import OktaSignInWidget from '../okta_widget.js';
import { Redirect } from 'react-router-dom';

interface LoginProps {
  auth: Auth;
  baseUrl: string;
}

interface LoginState {
  authenticated: boolean;
}
// Class: Login
// Purpose: The login page with okta widget sign in, if signed in already, reroutes to the homepage.
export default withAuth (class Login extends Component<LoginProps, LoginState> {
      /*
    * Method:       constructor
    * Description:  Constructor for the Login component page. Bind all relevant functions and set states.
    * Params:       
    *   props - the props to initialize with
    * Return:       na
    */
    constructor(props){
        super(props);
        this.onSuccess = this.onSuccess.bind(this);
        this.onError = this.onError.bind(this);
        this.state = {authenticated: false};
        this.checkAuthentication = this.checkAuthentication.bind(this);
      }
    
    /*
    * Method:       checkAuthentication
    * Description:  Check if the user is authenticated
    * Params:       void
    * Return:       na
    */
      async checkAuthentication() {
        console.log(this.props.auth)
        const authenticated = await this.props.auth.isAuthenticated();
        if (authenticated !== this.state.authenticated) {
          this.setState({ authenticated });
        }
      }

    /*
    * Method:       onSuccess 
    * Description:  called on success of the okta widget.
    * Params:       res - the result of success
    * Return:       redirect with session token
    */
      onSuccess(res) {
        if (res.status === 'SUCCESS') {
          return this.props.auth.redirect({
            sessionToken: res.session.token
          });
       } else {
        // The user can be in another authentication state that requires further action.
        // For more information about these states, see:
        //   https://github.com/okta/okta-signin-widget#rendereloptions-success-error
        }
      }

    /*
    * Method:       onError 
    * Description:  called on error from the okta widget.
    * Params:       err - the error
    * Return:       void
    */
      onError(err) {
        console.log('error logging in', err);
      }

    /*
    * Method:       componentDidMount 
    * Description:  Check the authentication when the component mounts
    * Params:       void
    * Return:       void
    */
      async componentDidMount() {
        await this.checkAuthentication();
      }
    
    /*
    * Method:       componentDidUpdate 
    * Description:  Check the authentication when the component updates
    * Params:       void
    * Return:       void
    */
      async componentDidUpdate() {
        await this.checkAuthentication();
      }

    /*
    * Method:       render 
    * Description:  Render the login screen with the okta sign in widget
    * Params:       void
    * Return:       void
    */
      render(){
        if (this.state.authenticated === null) return null;
          return this.state.authenticated ?
            <Redirect to={{ pathname: '/' }}/> :
            <div style={{backgroundColor:"white",width:"100%"}}><OktaSignInWidget
              baseUrl={this.props.baseUrl}
              onSuccess={this.onSuccess}
              onError={this.onError}/></div>;
        }
  });