/*
* FILE:           server_calls.js
* PROJECT:        HeRVY
* FIRST VERSION:  April 10, 2020
* PROGRAMMER:     Emily Goodwin
* DESCRIPTION:    Contains functions to make calls to the main HeRVY server.
*/
import { isNullOrUndefined } from "util";
import {formatNumber} from './common';
 

/*
*   FUNCTION: writeToFile
*   DESCRIPTION: Write the heart rate data to a file on the server.
*   PARAMETERS: data - the data to write to file
*   RETURN: the response from the server
*/
export function writeToFile(data){
    var apiPath = new URL("http://localhost:8080/write-file");
    fetch(apiPath, { 
        method:"POST",
        headers:new Headers({
          'Content-Type':'application/json',
          'Mode':'cors',
        }),
        body: JSON.stringify(data)
      })
      .then ((response) => {
        console.log("Writing to file response:%o", response);
      })
}

/*
*   FUNCTION: getAnxietyTimes
*   DESCRIPTION: Get the anxiety times from the server for the given date.
*   PARAMETERS: 
*     date - the date to use to get the anxiety times for
*     callback - the call back function to send the events too      
*   RETURN: Calls the callback function with the results.
*/
export function getAnxietyTimes(date, callback){
  var apiPath = new URL("http://localhost:8080/anxiety-from-date");
  fetch(apiPath, { 
    method:"POST",
    headers:new Headers({
      'Content-Type':'application/json',
      'Mode':'cors',
    }),
    body: JSON.stringify({date:date.toISOString()})
  })
  .then ((response) => {
    return response.json();
  })
  .then ((response) => {
    console.log("got anxiety times:%o", response);
    callback(response);
  })
}

/*
*   FUNCTION: isUserAnxious
*   DESCRIPTION: Is the user anxious at the given time?
*   PARAMETERS: 
*     datetime - the date and time to use to get the anxiety times for
*     callback - the call back function to send the events too      
*   RETURN: Calls the callback function with the true or false is the user is anxious
*/
export function isUserAnxious(datetime, callback) {
  var apiPath = new URL("http://localhost:8080/is-user-anxious");
  var time = "00:00";
  if (isNullOrUndefined(datetime)){
    datetime = new Date(Date.now())
    time = formatNumber(datetime.getHours()) + ":" + formatNumber(datetime.getMinutes());
  }
  else {
    console.log("user anxious time %o", time)
    var temp = new Date(datetime);
    temp.setMinutes(temp.getMinutes()-15);
    time = formatNumber(temp.getHours()) + ":" + formatNumber(temp.getMinutes());    
  }
  fetch(apiPath, { 
    method:"POST",
    headers:new Headers({
      'Content-Type':'application/json',
      'Mode':'cors',
    }),
    body: JSON.stringify({date:datetime.toISOString(), "time":time})
  })
  .then ((response) => {
    console.log("user is anxious? %o", response);
    return response.text();
  })
  .then ((response) => {
    console.log("calling callback with %o", response)
    callback(response);
  })
  .catch((error) => {
    console.log(error);
    callback(null);
  })  
}

/*
*   FUNCTION: getDailyPatterns
*   DESCRIPTION: Get the daily patterns for the date range from the server.
*   PARAMETERS: 
*     startDate - The starting date for the date range
*     endDate - The end date for the date range
*     callback - The callback function to send the results to when finished.
*   RETURN: Calls the callback function with the results
*/
export function getDailyPatterns(startDate, endDate, callback){
  var apiPath = new URL("http://localhost:8080/daily-pattern");

  var jsonData = {
    "startDate":startDate,
    "endDate":endDate
  }
  console.log("Getting daily patterns from server with: %o", jsonData)
  fetch(apiPath, { 
    method:"POST",
    headers:new Headers({
      'Content-Type':'application/json',
      'Mode':'cors',
    }),
    body: JSON.stringify(jsonData)
  })
  .then ((response) => {
    if (response.ok) {
      console.log("got daily times:%o", response);
      return response.json();
    }
    else {
      throw new Error("Fetch encountered an error.");
    }
  })
  .then ((response) => {
    callback(response);
    console.log("daily patterns returned: %o", response);
  })
  .catch((error) => {
    console.log(error);
    callback(null);
  })  
}

/*
*   FUNCTION: getWeeklyPatterns
*   DESCRIPTION: Get the weekly patterns for the date range from the server.
*   PARAMETERS: 
*     startDate - The starting date for the date range
*     endDate - The end date for the date range
*     callback - The callback function to send the results to when finished.
*   RETURN: Calls the callback function with the results
*/
export function getWeeklyPatterns(startDate, endDate, callback){
  var apiPath = new URL("http://localhost:8080/weekly-pattern");

  var jsonData = {
    "startDate":startDate,
    "endDate":endDate
  }
  try{
      fetch(apiPath, { 
      method:"POST",
      headers:new Headers({
        'Content-Type':'application/json',
        'Mode':'cors',
      }),
      body: JSON.stringify(jsonData)
    })
    .then ((response) => {
      console.log("got weekly times:%o", response);
      return response.json();
    })
    .then ((response) => {
      callback(response);
    })
  }
  catch(err){
    console.log(err);
    callback(null);
  }
}