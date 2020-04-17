/*
* FILE:           Home.tsx
* PROJECT:        HeRVY
* FIRST VERSION:  April 10, 2020
* PROGRAMMER:     Emily Goodwin
* DESCRIPTION:    Contains the code for the homepage of the HeRVY proof of concept application.
*                 Displays the users last known heart rate, the time, a graph containing heart rate values, 
*                 and the user's anxious times from the backend server.
*/ 

import { IonContent, IonHeader, IonPage, 
  IonButton, IonCard, IonCardContent, 
  IonMenuButton,
  IonToolbar,
  IonSplitPane} from '@ionic/react';
import {ToastContainer, toast} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import React from 'react';
import {GetTodaysHeartRate} from "../fitbit.js" 
import {GetOktaToken,ValidateOktaToken} from '../okta_functions.js';
import {Menu} from './Menu'
import { isNullOrUndefined } from 'util';
import AnxietyList from './AnxietyList';
import 'local-storage';
import {getAnxietyTimes, isUserAnxious} from '../server_calls';
import {Line} from 'react-chartjs-2';

interface IHomeProps {
}

interface IHomeStates {
  lastSync: Date;
  lastHeartRateTime:String;
  heartRate:Number;
  anxietyList:any;
  chartData: ChartData;
  userAnxiety:String;
}

type ChartData = {
  labels:any[],
  datasets:[{
    label:String,
    data:any[]
  }]
}

class Home extends React.Component<IHomeProps, IHomeStates> {
  interval;

    /*
    * Method:       constructor
    * Description:  Constructor for the Home component page. Bind all relevant functions and set states.
    * Params:       
    *   props - the props to initialize with
    * Return:       na
    */
  constructor(props) {
    super(props);
    var chartData = { 
      labels: [] as any[],
      datasets: [{
        label: "HeartRate",
        data:[] as any[],
      }]
    } as ChartData;

    this.state = { lastSync: new Date(0), lastHeartRateTime: "", heartRate: 0, anxietyList:"", chartData:chartData, userAnxiety:""}
    this.updateTime = this.updateTime.bind(this);
    this.updateHeartRate = this.updateHeartRate.bind(this);
    this.fitbitCallbackHandler = this.fitbitCallbackHandler.bind(this);
    this.updateAnxietyList = this.updateAnxietyList.bind(this);
    this.getServerData = this.getServerData.bind(this);
    this.anxietyCallbackHandler = this.anxietyCallbackHandler.bind(this);
    this.timer = this.timer.bind(this);
    this.anxietyElement = this.anxietyElement.bind(this);
  }

  /*
  * Method:       componentDidMount
  * Description:  Setup the states when the component mounts, before it renders to display 
  *               the old session data. Get & validate the okta token for login.
  * Params:       void
  * Return:       void
  */
  componentDidMount() {
    const lastSyncString = sessionStorage.getItem("lastSync"); 
    var lastSync = lastSyncString ? new Date(lastSyncString) : new Date(0);
    const lastHeartRateTimeString = sessionStorage.getItem("lastHeartRateTime");
    var lastHeartRateTime = lastHeartRateTimeString ? lastHeartRateTimeString : "";
    const heartRateString = sessionStorage.getItem("heartRate");
    var heartRate = heartRateString ? heartRateString : 0;
    const anxietyListString = sessionStorage.getItem("anxietyList");
    var anxietyList = anxietyListString ? JSON.parse(anxietyListString) : "";

    this.updateTime(lastSync, false);
    this.updateHeartRate(heartRate, lastHeartRateTime, false);
    this.updateAnxietyList(anxietyList, false);
    this.timer();

    if (isNullOrUndefined(sessionStorage.getItem("oktaAccessToken"))) {
      if (GetOktaToken())
      {
        ValidateOktaToken("accessToken");
      }
    }
  }

  /*
  * Method:       fitbitCallbackHandler
  * Description:  Handles the fitbit callbacks's data, parses the heart rate data for 
  *               display and gets the anxious times from the server with the data
  * Params:       results - the results from fitbit call
  * Return:       void
  */
  fitbitCallbackHandler(results) {
    console.log(results);
    if (results["error"] === false) {
      var heartRateValues = results["heartRateValues"];
      if (!isNullOrUndefined(heartRateValues)) {
        var lastHeartRate = heartRateValues["heartRateValues"][heartRateValues["heartRateValues"].length - 1]
        this.updateTime(new Date(Date.now()));
        if (!isNullOrUndefined(lastHeartRate)) {
          getAnxietyTimes(new Date(Date.now()), this.updateAnxietyList);
          this.updateHeartRate(lastHeartRate["value"], lastHeartRate["time"]);
        }
        if (heartRateValues.heartRateValues.length > 0){ 
          var tempState = this.state.chartData;
          // empty graph 
          tempState.labels = [];
          tempState.datasets[0].data = [];
          this.setState({chartData:tempState});
          for (var item in heartRateValues.heartRateValues){
              this.state.chartData.labels.push(heartRateValues.heartRateValues[item].time);
              this.state.chartData.datasets[0].data.push(heartRateValues.heartRateValues[item].value);
          }   
          console.log("chart data %o", this.state.chartData);                             
      }
      }
    }
    else{
      console.log(results["errorText"]);
      toast(results["errorText"], {autoClose: 15000});
    }
  }

  /*
  * Method:       anxietyCallbackHandler
  * Description:  Handles the anxiety request callback, if the user is anxious display the anxiety tips html
  * Params:       data - the results from the call
  * Return:       void
  */
  anxietyCallbackHandler(data){
    if (!isNullOrUndefined(data)){
      console.log("got %o from is user anxious", data as boolean);
      if (data.toLowerCase() === "true") {
        this.setState({userAnxiety: this.anxietyElement(data)});
      }
    }
    else {
      this.setState({userAnxiety:""});
    }
  }

  /*
  * Method:       updateHeartRate
  * Description:  Update the heart rate state to display the last gotten heart rate from the server.
  * Params:       
  *   heartRate - The heart rate to update the heartRate state to
  *   lastHeartRateTime - the time of the last heart rate in HH:mm
  *   updateStorage - if we should update the session storage values as well
  * Return:       void
  */
  updateHeartRate(heartRate, lastHeartRateTime, updateStorage = true) {
    this.setState({heartRate: heartRate, lastHeartRateTime: lastHeartRateTime})
    if (updateStorage) {
      sessionStorage.setItem("heartRate", heartRate);
      sessionStorage.setItem("lastHeartRateTime", lastHeartRateTime);
    }
  }

  /*
  * Method:       updateAnxietyList
  * Description:  Update the anxiety list state with the given data to display to the user.
  * Params:       
  *   anxietyList - the anxiety list 
  *   updateStorage - if we should update the session storage values as well
  * Return:       void
  */
  updateAnxietyList(anxietyList, updateStorage = true){
    if (!isNullOrUndefined(anxietyList))
    {
      this.setState({anxietyList: anxietyList});
      if (updateStorage) {
        sessionStorage.setItem("anxietyList", JSON.stringify(anxietyList));
      }
    }
  }

  /*
  * Method:       updateTime
  * Description:  Update the last sync time state with the given time to display to the user.
  * Params:       
  *   lastSync - the last sync datetime
  *   updateStorage - if we should update the session storage values as well
  * Return:       void
  */
  updateTime(lastSync, updateStorage = true){
    this.setState({lastSync: lastSync});
    if (updateStorage) {
      sessionStorage.setItem("lastSync", lastSync);
    }
  }

  /*
  * Method:       timer
  * Description:  Sets up the interval timer to get the data from the server and fitbit every 5 minutes.
  * Params:       void
  * Return:       void
  */
  timer(){
    if(isNullOrUndefined(this.interval)){
      this.interval = setInterval(this.getServerData, 300000);// call it every 5 minutes
    }
  }

  /*
  * Method:       getServerData
  * Description:  Get the heart rate data, anxiety times, and if the user is anxious from the server and fitbit.
  * Params:       void
  * Return:       void
  */
  getServerData(){
    GetTodaysHeartRate(this.fitbitCallbackHandler);
    //subtracts 10 minutes from current date to see if the user is currently anxious because fitbit sync update takes a while.
    var timeToAnalyze = new Date(Date.now()-600000);
    isUserAnxious(timeToAnalyze, this.anxietyCallbackHandler);
  }

  /*
  * Method:       anxietyElement
  * Description:  Create&return the anxiety div, telling the user their status
  * Params:       value - if the user is anxious or not
  * Return:       the html elements to create the box
  */
  anxietyElement(value){
    var ret = [] as any;
    if (value) {
      ret.push(
        <div>
          {/* eslint-disable-next-line */}
          <p>User seems anxious, see tips & tricks page.</p>
          {/* eslint-disable-next-line */}
          <p>Is this accurate? <a href="">Yes</a> or <a href="">No</a></p>
        </div>);
    }
    return ret;
  }

  /*
  * Method:       render
  * Description:  Render the home page. Contains the menu, logo, heart rate statistics, and anxiety data.
  * Params:       void
  * Return:       the components to render the page
  */
  render()
  {
    const NULL_DATE = new Date(0);
    return (
      <IonSplitPane contentId="main">
        <Menu/>
        <IonPage id="main">
        <IonHeader>
          <IonToolbar color="translucent">
            <IonMenuButton slot="start"></IonMenuButton>
          </IonToolbar>
        </IonHeader>
        <IonContent className="ion-padding">
        <img alt="hervy_logo" style={{display:"block",marginRight:"auto", marginLeft:"auto"}}
           src="https://res.cloudinary.com/dh4argguk/image/upload/v1586386305/hervylogo_t2kj7u.png" />
          <IonCard>
            <div style={{textAlign:"center"}}>
              <IonCardContent>
                <div><div style={{fontSize:"30px", display:"inline-block"}}>{this.state.heartRate}</div> bpm</div>
                <div>at {(this.state.lastHeartRateTime === "") ? "N/A" : this.state.lastHeartRateTime}</div>
              </IonCardContent>
              {this.state.userAnxiety}
            </div>
            <IonCardContent color="light">Last Sync Time {(this.state.lastSync.getTime() !== NULL_DATE.getTime()) ? (this.state.lastSync.toLocaleDateString() + " " + this.state.lastSync.toLocaleTimeString()) : "N/A"}</IonCardContent>
          </IonCard>
          {(isNullOrUndefined(sessionStorage.getItem("fitbitToken")) || sessionStorage.getItem("fitbitToken") === "") ? (<IonButton href="https://www.fitbit.com/oauth2/authorize?response_type=token&client_id=22BJ3G&redirect_uri=http%3A%2F%2Flocalhost%3A8100%2Ffitbit%2Fcallback&scope=activity%20heartrate%20location%20nutrition%20profile%20settings%20sleep%20social%20weight&expires_in=2592000" shape="round" color="primary">Link to Fitbit</IonButton>) : null}
          <div>
            <Line data={this.state.chartData} 
                  redraw={true} 
                  options={{responsive:true, maintainAspectRatio:true}}/>
          </div>
          <div style={{display:"flex", alignItems:"center",justifyContent:"center"}}>
            <IonButton onClick={this.getServerData}>Get Today's Data</IonButton>
          </div>
          <div style={{justifyContent:"center", alignItems:"center", display:"flex"}}>
            <AnxietyList data={this.state.anxietyList}></AnxietyList>
          </div>
        </IonContent>
        <ToastContainer position={toast.POSITION.BOTTOM_CENTER}/>
      </IonPage>
      </IonSplitPane>
    );
  }
};

export default Home;
