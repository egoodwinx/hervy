/*
* FILE:           Menu.tsx
* PROJECT:        HeRVY
* FIRST VERSION:  April 10, 2020
* PROGRAMMER:     Emily Goodwin
* DESCRIPTION:    Contains the code for the side menu.
*/ 

import React from 'react';
import { withRouter } from "react-router-dom";
import {IonMenu, IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonRouterOutlet} from '@ionic/react'

// Class: Menu
// Purpose: render the side navigation menu for ios using ionic
export const Menu: React.FC = () => {
    return (
    <>
        <IonMenu side="start" contentId="main">
            <IonHeader>
                <IonToolbar color="translucent">
                    <IonTitle>Menu</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent>
                <IonList>
                    <IonItem href="home">Home</IonItem>
                    <IonItem href="/tabs/daily">Anxiety Patterns</IonItem>
                    <IonItem href="heartRateData">Heart Rate Values</IonItem>
                </IonList>
            </IonContent>
        </IonMenu>
        <IonRouterOutlet id="menu"></IonRouterOutlet>
    </>
    );
    }
    export default withRouter(Menu);
