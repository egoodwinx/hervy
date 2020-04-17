/*
* File          : fitbit.js
* Project       : Capstone
* Programmer    : Emily Goodwin
* First Version : January 30, 2020
* Description   : Contains the Fitbit web api code to get information from Fitbit.
*/

import { isNullOrUndefined } from "util";
import { writeToFile } from "./server_calls";
import {FITBIT_SECRET, FITBIT_ID} from './private_config.js';
import {formatNumber} from './common';
const FitbitApiClient = require("fitbit-node");

var client = new FitbitApiClient({clientId: FITBIT_ID, clientSecret: FITBIT_SECRET, apiVersion: "1.2"});

/*
* Method:       GetFitbitToken
* Description:  Get the token from the callback url and the user id for future calls. Save it in session variables.
* Params:       void
* Return:       void
*/
export function GetFitbitToken()
{
    const urlParams = new URLSearchParams((window.location.hash).replace('#', ''));
    var token = urlParams.get('access_token');
    var user_id = urlParams.get('user_id');
    sessionStorage.setItem("fitbitToken", token)
    sessionStorage.setItem("userId", user_id);
}

/*
* Method:       GetFitbitData
* Description:  Get the data from fitbit. Heart rate and activity. Is called every minute.
* Params:       void
* Return:       void
*/
export function GetFitbitData(callback) {
    var currentDateTime = new Date();
    return GetHeartRate(currentDateTime, callback);
}

/*
* Method:       GetHeartRate
* Description:  Get heart rate for the past 30 minutes from fitbit.
* Params:       currentDateTime
* Return:       void
*/
export function GetHeartRate(currentDateTime, callback)
{
    if (!isNullOrUndefined(sessionStorage.getItem("fitbitToken")))
    {
        console.log(currentDateTime.getTime());
        var timeStart = currentDateTime.getHours().toString() + ":" + formatNumber(new Date(currentDateTime.getTime() - (30*1000)).getMinutes());
        var timeEnd = currentDateTime.getHours().toString() + ":" + formatNumber(currentDateTime.getMinutes());
        console.log("getting heart rate")
        console.log(timeStart);
        console.log(timeEnd);
        // get the heart rate for the current user for today & activity level for the last minute 
        //GET https://api.fitbit.com/1/user/-/activities/heart/date/today/1sec.json
        client.get("/activities/heart/date/today/1d/1sec/time/" + timeStart + "/" + timeEnd + ".json", sessionStorage.getItem("fitbitToken"))
        .then(results => {fitbitHandler(results, callback)});}
}

/*
* Method:       fitbitHandler
* Description:  handles callback for heart rate data from fitbit, parsing the data.
* Params:          
*   result - result to parse from fitbit
*   callback - the callback function to call with the results
* Return:       Calls the callback function with the results.
*/
function fitbitHandler(result, callback) {
    var parsedHeartRateValues = {
        date:new Date(),
        heartRateValues:[]
    };

    var ret = {
        error:true,
        errorText:"",
        heartRateValues:parsedHeartRateValues
    }
    console.log("results from heart rate intraday series: %o", result);
    if (!isNullOrUndefined(result)){
        if (result[1]["statusCode"] === 200) {
            parsedHeartRateValues.heartRateValues = result[0]["activities-heart-intraday"]["dataset"];
            console.log("parsed values = %o", parsedHeartRateValues);
            writeToFile(parsedHeartRateValues);
            ret.error = false;
        }
        else if (result[0]["success"] === false) {
            var error = result[0]["errors"][0];
            if (!isNullOrUndefined(error)) {
                if (error["errorType"] === "invalid_token") {
                    console.log("test")
                    sessionStorage.setItem("fitbitToken", "");
                }
                ret.errorText = error["message"];
            }
        }
    }
    callback(ret);
}

/*
* Method:       GetTodaysHeartRate
* Description:  Get heart rate for every second of today
* Params:       
*   callback - the function to callback when finished
* Return:       Calls the callback function with the result
*/
export function GetTodaysHeartRate(callback)
{
    if (sessionStorage.getItem("fitbitToken") != null)
    {        
        // get resting heart rate for today for comparison
        console.log("getting days heart rate")
        // get the heart rate for the current user for today & activity level for the last minute 
        //GET https://api.fitbit.com/1/user/-/activities/heart/date/today/1d/1sec.json
        client.get("/activities/heart/date/today/1d/1sec.json", sessionStorage.getItem("fitbitToken"))
        .then(results => {fitbitHandler(results, callback)});
    }
}

/*
* Method:       GetHeartRateDataByDate
* Description:  Get heart rate data for the given date
* Params:       
*   currentDateTime: the current date, date needs to be YYYY-MM-dd
*   callback - the function to callback with the result
* Return:       Calls the callback function with the results
*/
export function GetHeartRateDataByDate(currentDateTime, callback) {
    if (sessionStorage.getItem("fitbitToken") != null)
    {
        if (!isNullOrUndefined(currentDateTime)){
            var formattedDate = currentDateTime.getFullYear() + "-" + formatNumber(currentDateTime.getMonth()+1) + "-" +formatNumber(currentDateTime.getDate());
            // get the heart rate for the current user for today & activity level for the last minute 
            //GET https://api.fitbit.com/1/user/-/activities/heart/date/today/1m.json
            client.get("/activities/heart/date/"+ formattedDate + "/1d/1sec/time/00:00/23:59.json", sessionStorage.getItem("fitbitToken"))
            .then(results => {fitbitHandler(results, callback)});
        }
    }
}