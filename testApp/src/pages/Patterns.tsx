/*
* FILE:           Patterns.tsx
* PROJECT:        HeRVY
* FIRST VERSION:  April 10, 2020
* PROGRAMMER:     Emily Goodwin
* DESCRIPTION:    Contains the code for rendering the patterns view page with the tabs at the bottom.
*/ 

import React from 'react';
import { IonTabs, IonTabBar, IonTabButton, IonLabel, IonRouterOutlet, IonToolbar, IonFooter } from '@ionic/react';
import { Redirect, Route } from 'react-router-dom';
import Daily from './Daily';
import Weekly from './Weekly';

// Class: Patterns
// Purpose: Contains the rendering for the patterns page containing the daily and weekly patterns.
class Patterns extends React.Component {
    /*
    * Method:       render
    * Description:  Render the patterns component and setout routes for the tabs
    * Params:       void
    * Return:       the components to render the page
    */
    render() {
        return (
            <>
            <IonFooter>
                <IonToolbar>            
                    <IonTabs>
                        <IonRouterOutlet>
                            <Redirect exact path="/tabs" to="/tabs/daily"/>
                            <Route path="tabs/daily" render={()=><Daily/>} exact={true} />
                            <Route path="tabs/weekly" render={()=><Weekly/>} exact={true}/>
                        </IonRouterOutlet>
                        <IonTabBar slot="bottom">
                            <IonTabButton tab="daily" href="/tabs/daily" selected={true}>
                                <IonLabel>Daily</IonLabel>
                            </IonTabButton>
                            <IonTabButton tab="weekly" href="/tabs/weekly">
                                <IonLabel>Weekly</IonLabel>
                            </IonTabButton>
                        </IonTabBar>
                    </IonTabs>
                </IonToolbar>    
            </IonFooter>
            </>
        );
    }
}

export default Patterns;