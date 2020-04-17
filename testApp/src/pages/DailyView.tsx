/*
* FILE:           DailyView.tsx
* PROJECT:        HeRVY
* FIRST VERSION:  April 10, 2020
* PROGRAMMER:     Emily Goodwin
* DESCRIPTION:    Contains the code to draw the daily patterns table.
*/ 

import React from 'react';
import {getDailyPatterns} from '../server_calls';
import { isNullOrUndefined } from 'util';

interface DailyViewProps {
}

interface DailyViewStates {
    table:[]
}

// Class:   DailyView
// Purpose: Contains the component modelling for the daily patterns table which displays
//          the patterns of anxiety on a hour by hour basis.
class DailyView extends React.Component<DailyViewProps, DailyViewStates> {

    
    /*
    * Method:       constructor
    * Description:  Constructor for the DailyView component. Bind all relevant functions and set states.
    * Params:       
    *   props - the props to initialize with
    * Return:       na
    */
    constructor(props){
        super(props);
        this.state = {table:[]};
        this.getTable = this.getTable.bind(this);
        this.updateTable = this.updateTable.bind(this);
        this.getDailyDataHandler = this.getDailyDataHandler.bind(this);
    }

    componentDidMount(){
        this.updateTable(this.getTable(null));// call once to setup framework
        this.getDailyData();
    }

    getDailyDataHandler(results){
        this.updateTable(this.getTable(results));
    }

    updateTable(table){
        if (!isNullOrUndefined(table)){
            this.setState({table:table});
        }
    }

    /*
    * Method:       getTable
    * Description:  Get the table for the given data as the built html. Formats the data
    *               into a table for easy readability
    * Params:       data - the data to fill the table with
    * Return:       the table's HTML code to render
    */
    getTable(data){
        let ret: any[] = [];
        var dataObj = JSON.parse(data);
        for (var i = 0; i < 24; i++)
        {
            let children: any[] = [];
            for(var j = 0; j < 2; j++)
            {
                if (j === 0)
                {
                    children.push(<td key={j} style={{textAlign:"center"}}>{(i < 10)?('0'+i+":00"):(i+":00")}</td>)
                }
                else
                {
                    if (!isNullOrUndefined(dataObj)){
                        var value = dataObj[i];
                        if (!isNullOrUndefined(value)){
                            children.push(<td key={j} style={{textAlign:"center", height:"45px"}}>{(value>0)?value:null}</td>)
                        }
                        else {
                            children.push(<td>{null}</td>)
                        }
                    }
                }
            }
            if (children.length > 0){
                ret.push(<tr key={i}>{children}</tr>)
            }
        }
        return ret;
    }

    getDailyData(){
        var startDate = new Date(Date.now())
        var endDate = new Date(Date.now());
        startDate.setMonth(startDate.getMonth()-1);

        getDailyPatterns(startDate, endDate, this.getDailyDataHandler);
    }


    
    render(){
          return(  
            <>
            <div style={{width:"100%", overflowY:"auto"}}>
                <span>         
                    <table style={{width:"100%"}}>
                        <thead>
                            <tr>
                                <th style={{height:"30px"}}>Time</th>
                                <th>Day</th>
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

export default DailyView;