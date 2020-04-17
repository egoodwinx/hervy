/*
* File          : okta.js
* Project       : Capstone
* Programmer    : Emily Goodwin
* First Version : February 9, 2020
* Description   : Contains the okta related functions 
*/

import {OKTA_ID} from './private_config';

var options = {
  method: 'POST',
  url: 'https://dev-355380.okta.com/oauth2/default',
  headers: {'content-type': 'application/x-www-form-urlencoded',
'Access-Control-Allow-Origin':'*'},
  form: {
    grant_type: 'authorization_code',
    client_id: OKTA_ID,
    client_secret: 'YOUR_CLIENT_SECRET',
    code: 'YOUR_AUTHORIZATION_CODE',
    redirect_uri: 'http://localhost:8100/home'
  }
};  

/*
* Method:       GetOktaToken
* Description:  Get the token from the callback url and the user id for future calls. Save it in session variables.
* Params:       void
* Return:       void
*/
export function GetOktaToken() {
  const urlParams = new URLSearchParams((window.location.hash).replace('#', ''));
  var token = urlParams.get('access_token');
  if (token !== null | token !== "")
  {
    options.form.code = token;
    sessionStorage.setItem("oktaAccessToken", token)
    return true;
  }
  return false;
}

/*
* Method:       ValidateOktaToken
* Description:  Validate the okta token.
* Params:       
*   tokenType - the type of token to validate
* Return:       returns the results from the okta api call, if the token is valid or not
*/
export function ValidateOktaToken(tokenType) {
  if (tokenType === "id_token") {
    if(sessionStorage.getItem("oktaTokenID") !== null) {
      var urlTokenID = "https://dev-355380.okta.com/oauth2/default/v1/introspect",
        tokenIDParams = {token:sessionStorage.getItem("oktaTokenID"), token_type_hint:"id_token",client_id:options.form.client_id};
      Object.keys(tokenIDParams).forEach(key=> urlTokenID.searchParams.append(key, tokenIDParams[key]));
      fetch(urlTokenID, { 
        method:"POST",
        })
      .then ((response) => {
        return response.json();
      })
      .then ((json) => {
        console.log(json);
      })
    }
  }
  else if (tokenType === "accessToken") {
    if(sessionStorage.getItem("oktaAccessToken") !== null) {
      var urlAccessToken = new URL ("https://dev-355380.okta.com/oauth2/default/v1/introspect"),
               accessTokenParams = {token:sessionStorage.getItem("oktaAccessToken"), token_type_hint:"accessToken",client_id:options.form.client_id} ;
      Object.keys(accessTokenParams).forEach(key=> urlAccessToken.searchParams.append(key, accessTokenParams[key]));
      fetch(urlAccessToken, { 
        method:"POST",
        mode: "cors",
        headers:{
          'Content-Type':'application/x-www-form-urlencoded',
        },
      })
      .then ((response) => {
        return response.json();
      })
      .then ((json) => {
        console.log(json);
        return json.active;
      });
    }
  }
}