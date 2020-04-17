/*
* FILE:           AnxietyList.tsx
* PROJECT:        HeRVY
* FIRST VERSION:  April 10, 2020
* PROGRAMMER:     Emily Goodwin
* DESCRIPTION:    Contains the code to render the anxiety times list.
*/ 

import React from 'react'
import {IonList, IonListHeader, IonItem, IonLabel} from '@ionic/react'
import { isNullOrUndefined } from 'util';

interface AnxietyProps {
    data: String
}

interface AnxietyState {

}

// Class: AnxietyList:
// Purpose: The component to display the list of anxiety times.
class AnxietyList extends React.Component <AnxietyProps, AnxietyState> {
    /*
    * Method:       createAnxietyList
    * Description:  Create the anxiety list from the given anxiety data.
    * Params:       
    *   data - the json anxiety data
    * Return:       the formatted render components containing the supplied data
    */
    createAnxietyList(data){
        let ret: any[] = [];
        if (!isNullOrUndefined(data) && data !=="")
        {
            var startTimes = data["start times"]
            var endTimes = data["end times"]
            for(var i = 0; i< Object.keys(startTimes).length; i++) {
                ret.push(<IonItem key={i}><IonLabel>{startTimes[i].split(' ')[1]} - {endTimes[i].split(' ')[1]}</IonLabel></IonItem>)
            }
        }
        return ret;
    }

    /*
    * Method:       render
    * Description:  Create the render for the anxiety list.
    * Params:       void
    * Return:       The components to render.
    */
    render(){
        return (
            <>
            <IonList>
                <IonListHeader>
                    <h1>Anxious Times</h1>
                </IonListHeader>
                {this.createAnxietyList(this.props.data)}
            </IonList>
            </>
        );
    }
}

export default AnxietyList;