
/*
* File          : okta_widget.js
* Project       : Capstone
* Programmer    : Emily Goodwin
* First Version : January 30, 2020
* Description   : Contains code necessary for the Okta sign in widget.
*/

import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import OktaSignIn from '@okta/okta-signin-widget';
import '@okta/okta-signin-widget/dist/css/okta-sign-in.min.css';

// Class: OktaSignInWidget
// Purpose: Class for the okta sign in widget.
export default class OktaSignInWidget extends Component {

  /*
  * Method:       componentDidMount
  * Description:  Sets the variables needed for rendering the widget.
  * Params:       void
  * Return:       
  */
  componentDidMount() {
    const el = ReactDOM.findDOMNode(this);
    this.widget = new OktaSignIn({
      baseUrl: this.props.baseUrl,
      authParams: {
        pkce: true
      }
    });
    this.widget.renderEl({el}, this.props.onSuccess, this.props.onError);
  }

  /*
  * Method:       componentWillUnmount
  * Description:  Remove the widget when component is going to unmount
  * Params:       void
  * Return:       
  */
  componentWillUnmount() {
    this.widget.remove();
  }

  
  /*
  * Method:       render
  * Description:  Render a div, will display the okta widget in the div.
  * Params:       void
  * Return:       renders to screen
  */
  render() {
    return <div />;
  }
};