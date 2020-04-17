/*
* FILE:           HeartRateData.tsx
* PROJECT:        HeRVY
* FIRST VERSION:  April 10, 2020
* PROGRAMMER:     Emily Goodwin
* DESCRIPTION:    Contains the code for the heart rate data page to be able to view different day's heart rate data.
*/ 

import { IonContent, IonHeader, IonPage, 
    IonButton, 
    IonMenuButton,
    IonToolbar,
    IonSplitPane} from '@ionic/react';
  import {ToastContainer, toast} from 'react-toastify';
  import 'react-toastify/dist/ReactToastify.css';
  import React from 'react';
  import {GetHeartRateDataByDate} from "../fitbit.js" 
  import {Menu} from './Menu'
  import { isNullOrUndefined } from 'util';
  import AnxietyList from './AnxietyList';
  import 'local-storage';
  import {getAnxietyTimes} from '../server_calls';
  import {Line} from 'react-chartjs-2';
  import DatePicker from 'react-datepicker';
  import "react-datepicker/dist/react-datepicker.css";

  type ChartData = {
    labels:any[],
    datasets:[{
      label:String,
      data:any[]
    }]
  }
  
  interface IHeartRateProps {
  }
  
  interface IHeartRateStates {
    anxietyList:any;
    selectedDate:Date;
    chartData:ChartData;
  }
  
  class HeartRateData extends React.Component<IHeartRateProps, IHeartRateStates> {

        
    /*
    * Method:       constructor
    * Description:  Constructor for the HeartRateData component page. Bind all relevant functions and set states.
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

      this.state = {anxietyList:"", selectedDate:new Date(Date.now()), chartData:chartData}
      this.fitbitCallbackHandler = this.fitbitCallbackHandler.bind(this);
      this.updateAnxietyList = this.updateAnxietyList.bind(this);
      this.handleDatePickerChange = this.handleDatePickerChange.bind(this);
      this.getServerData = this.getServerData.bind(this);
    }
  
    /*
    * Method:       fitbitCallbackHandler
    * Description:  Handles the fitbit results, sets up the graph with the data from fitbit
    * Params:       
    *   results - the results of the fitbit call
    * Return:       void
    */
    fitbitCallbackHandler(results) {
      console.log(results);
      if (results["error"] === false) {
        var heartRateValues = results["heartRateValues"];
        if (!isNullOrUndefined(heartRateValues)) {
          var lastHeartRate = heartRateValues["heartRateValues"][heartRateValues["heartRateValues"].length - 1]
          if (!isNullOrUndefined(lastHeartRate)) {
            getAnxietyTimes(new Date(Date.now()), this.updateAnxietyList);
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
    * Method:       updateAnxietyList
    * Description:  Update the anxiety list state with the given values 
    * Params:       
    *   anxietyList - the new anxiety list to set it up to
    *   updateStorage - should we update the storage value as well?
    * Return:       void
    */
    updateAnxietyList(anxietyList, updateStorage = true){
      if (!isNullOrUndefined(anxietyList))
      {
        this.setState({anxietyList: anxietyList});
      }
    }
  
    /*
    * Method:       getServerData
    * Description:  Get the data from the server for the selected date
    * Params:       void
    * Return:       void
    */
    getServerData(){
      if (!isNullOrUndefined(this.state.selectedDate)){
        GetHeartRateDataByDate(this.state.selectedDate, this.fitbitCallbackHandler);
      }
    }

    /*
    * Method:       handleDatePickerChange
    * Description:  When the date picker is changed change the selected date state.
    * Params:       date - the date to update the state to
    * Return:       void
    */
    handleDatePickerChange(date){
      this.setState({selectedDate:date});
    }

    /*
    * Method:       render
    * Description:  Render the heart date data page which allows the user to gather heart rate data by day
    * Params:       void
    * Return:       the components to render the page
    */
    render()
    {
      return (
        <IonSplitPane contentId="main">
          <Menu/>
          <IonPage id="main">
          <IonHeader>
            <IonToolbar color="translucent">
              <IonMenuButton slot="start"></IonMenuButton>
            </IonToolbar>
          </IonHeader>
          <IonContent className="ion-padding" >
            <div style={{display:"flex", alignItems:"center",justifyContent:"center"}}>
              <DatePicker selected={this.state.selectedDate} 
                          onChange={this.handleDatePickerChange}/>
            </div>
            {(isNullOrUndefined(sessionStorage.getItem("fitbitToken")) || sessionStorage.getItem("fitbitToken") === "") ? (<IonButton href="https://www.fitbit.com/oauth2/authorize?response_type=token&client_id=22BJ3G&redirect_uri=http%3A%2F%2Flocalhost%3A8100%2Ffitbit%2Fcallback&scope=activity%20heartrate%20location%20nutrition%20profile%20settings%20sleep%20social%20weight&expires_in=2592000" shape="round" color="primary">Link to Fitbit</IonButton>) : null}
            <div>
            <Line data={this.state.chartData} redraw={true} options={{responsive:true, maintainAspectRatio:true}}/></div>
            <div style={{display:"flex", alignItems:"center",justifyContent:"center"}}>
            <IonButton onClick={this.getServerData}>Get Data</IonButton>
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
  
  export default HeartRateData;
  