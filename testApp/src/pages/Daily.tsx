/*
* FILE:           Daily.tsx
* PROJECT:        HeRVY
* FIRST VERSION:  April 10, 2020
* PROGRAMMER:     Emily Goodwin
* DESCRIPTION:    Contains the code to draw the daily patterns content.
*/ 

import React from 'react';
import Patterns from './Patterns'
import {IonSplitPane, IonPage, IonToolbar, IonHeader, IonMenuButton } from '@ionic/react';
import Menu from './Menu'
import DailyView from './DailyView'

// Class: Daily
// Purpose: Contains the code for rendering the daily tab view.
class Daily extends React.Component {
    /*
    * Method:       render
    * Description:  render the Daily component. Displays the daily anxiety data.
    * Params:       void
    * Return:       the code to render the weekly view table
    */
    render(){
        return(
            <>
                <IonSplitPane contentId="main">
                <Menu/>
                <IonPage id="main">
                <IonHeader>
                    <IonToolbar color="translucent">
                        <IonMenuButton slot="start"></IonMenuButton>
                    </IonToolbar>
                </IonHeader>
                    <DailyView></DailyView>
                    <Patterns></Patterns>
                </IonPage>
                </IonSplitPane>
            </>
        );
    }
}

export default Daily;