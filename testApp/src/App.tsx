/*
* FILE:           App.tsx
* PROJECT:        HeRVY
* FIRST VERSION:  April 10, 2020
* PROGRAMMER:     Emily Goodwin
* DESCRIPTION:    Contains the code for the HeRVY front end prototype application.
*                 This ionic application proves as a proof-of-concept paired with the custom built
*                 REST API background powered by Python's CherryPy. It outlines how the desired
*                 application would work with Fitbit and be presented to the user.
*/ 

import React, { Component } from 'react';
import { Redirect, Route } from 'react-router-dom';
import { Security } from '@okta/okta-react';
import config from './app.config'
import Home from './pages/Home';
import Fitbit from './pages/Fitbit';
import Login from './pages/Login';
import Daily from './pages/Daily';
import Weekly from './pages/Weekly';
import HeartRateData from './pages/HeartRateData';
import {IonReactRouter} from '@ionic/react-router';
/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/* Theme variables */
import './theme/variables.css';

export interface Auth {
  login(redirectUri: string): {};
  logout(redirectUri: string): {};
  isAuthenticated(): boolean;
  getAccessToken(): string;
  redirect(token: any): {};
}

// Class: App
// Purpose: Contains the routing for the application and is the entry point of the application 
class App extends Component {
  /*
  * Method:       render
  * Description:  Render the application, contains the routing for the application
  * Params:       void
  * Return:       The contents of the application
  */
  render() {
    return (
      <IonReactRouter>
          <Security {...config}>
            <Route path="/home" component={Home} exact={true} />
            <Route exact path="/" render={() => <Redirect to="/login" />} />
            <Route path="/fitbit/callback" component={Fitbit} exact={true} />
            <Route path="/login" exact={true} render= {(props) => <Login {...props} baseUrl= {config.url}/>}/>
            <Route path="/tabs/Daily" component={Daily} exact={true} />
            <Route path="/tabs/Weekly" component={Weekly} exact={true}/>
            <Route path="/heartRateData" component={HeartRateData} exact={true}/>
          </Security>
      </IonReactRouter>
        
    );
  }
}

export default App;
