/*
* FILE:           Weekly.tsx
* PROJECT:        HeRVY
* FIRST VERSION:  April 10, 2020
* PROGRAMMER:     Emily Goodwin
* DESCRIPTION:    Contains the code to draw the weekly patterns content.
*/ 

import React from 'react';
import Patterns from './Patterns'
import {IonSplitPane, IonPage, IonHeader, IonToolbar, IonMenuButton } from '@ionic/react';
import Menu from './Menu'
import WeeklyView from './WeeklyView';

// Class: Weekly
// Purpose: Contains the code for rendering the weekly tab view.
class Weekly extends React.Component {
    /*
    * Method:       render
    * Description:  render the Weekly component. Displays the weekly anxiety data.
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
                    <WeeklyView></WeeklyView>
                    <Patterns></Patterns>
                </IonPage>
                </IonSplitPane>
            </>
        );
    }
}

export default Weekly;