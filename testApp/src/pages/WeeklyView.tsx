/*
* FILE:           WeeklyView.tsx
* PROJECT:        HeRVY
* FIRST VERSION:  April 10, 2020
* PROGRAMMER:     Emily Goodwin
* DESCRIPTION:    Contains the code to draw the weekly patterns table.
*/ 

import React from 'react';
import { getWeeklyPatterns } from '../server_calls';
import { isNullOrUndefined } from 'util'

interface WeeklyViewProps{

}

interface WeeklyViewStates{
    table:[]
}

// Class: WeeklyView
// Purpose: Component class for the weekly view table containing the weekly anxiety information.
class WeeklyView extends React.Component<WeeklyViewProps, WeeklyViewStates> {

    /*
    * Method:       constructor
    * Description:  Constructor for the WeeklyView component. Bind all relevant functions and set states.
    * Params:       
    *   props - the props to initialize with
    * Return:       na
    */
    constructor(props) {
        super(props);
        this.state ={table:[]};
        this.getTable = this.getTable.bind(this);
        this.updateTable = this.updateTable.bind(this);
        this.getWeeklyDataHandler = this.getWeeklyDataHandler.bind(this);
    }

    /*
    * Method:       componentDidMount
    * Description:  Set up the table before rendered to have the hours in the table, 
    *               then get the weekly data from the server.
    * Params:       void
    * Return:       void
    */
    componentDidMount(){
        this.updateTable(this.getTable(null));// call once to setup table
        this.getWeeklyData();
    }

    /*
    * Method:       getWeeklyDataHandler
    * Description:  Callback handler for getting the weekly data. Populates the table with results.
    * Params:       results - the results from the results to populate the table with
    * Return:       void
    */
    getWeeklyDataHandler(results){
        this.updateTable(this.getTable(results));
    }

    /*
    * Method:       updateTable
    * Description:  update the table state with the given value 
    * Params:       table - the table to update the state to
    * Return:       void
    */
    updateTable(table){
        if(!isNullOrUndefined(table)){
            this.setState({table:table});
        }
    }

    /*
    * Method:       getTable
    * Description:  Get the table for the given data as the built html. Formats the data
    *               into a table for easy readability
    * Params:       data - the data to fill the table with
    * Return:       the code to render the table body
    */
    getTable(data){
        let ret: any[] = [];
        var dataObj = JSON.parse(data);
        console.log(dataObj);

        for (var i = 0; i < 24; i++)
        {
            let children: any[] = [];
            for(var j = 0; j < 8; j++)
            {
                if (j === 0)
                {
                    children.push(<td key={j} style={{textAlign:"center"}}>{i < 10 ? '0' + i + ":00" : i + ":00"}</td>)
                }
                else
                {
                    if (!isNullOrUndefined(dataObj)){
                        var value = dataObj[j-1][i];
                        if (!isNullOrUndefined(value)){
                            children.push(<td key={j} style={{textAlign:"center", height:"45px"}}>{(value>0)?value:null}</td>)
                        }
                        else {
                            children.push(<td>{null}</td>)
                        }                        
                    }
                }
            }
            ret.push(<tr key={i}>{children}</tr>)
        }
        return ret;
    }
    
    /*
    * Method:       getWeeklyData
    * Description:  get the weekly anxiety data from the server to display in the component. 
    *               calls the server and sets the callback to getWeeklyDataHandler
    * Params:       void
    * Return:       void
    */
    getWeeklyData(){
        var startDate = new Date(Date.now())
        var endDate = new Date(Date.now());
        startDate.setMonth(startDate.getMonth()-1);

        getWeeklyPatterns(startDate, endDate, this.getWeeklyDataHandler);
    }

    /*
    * Method:       render
    * Description:  render the WeeklyView component. Displays the weekly anxiety data.
    * Params:       void
    * Return:       the code to render the weekly view table
    */
    render(){
          return(  
            <>
            <div style={{width:"100%", overflowY:"auto"}}>         
            <span>   
                <table style={{width:"100%"}}>
                    <thead>
                        <tr>
                            <th style={{height:"30px"}}>Time</th>
                            <th>Mon</th>
                            <th>Tue</th>
                            <th>Wed</th>
                            <th>Thu</th>
                            <th>Fri</th>
                            <th>Sat</th>
                            <th>Sun</th>
                        </tr>
                    </thead>
                    <tbody>
                        {this.state.table}
                    </tbody>
                </table>
                </span>
            </div>

            </>
        );
    }
}

export default WeeklyView;