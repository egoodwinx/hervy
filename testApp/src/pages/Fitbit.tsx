/*
* FILE:           Fitbit.tsx
* PROJECT:        HeRVY
* FIRST VERSION:  April 10, 2020
* PROGRAMMER:     Emily Goodwin
* DESCRIPTION:    Contains the rendering of the fitbit callback page.
*/ 

import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonButton } from '@ionic/react';
import React from 'react';
import {GetFitbitToken} from "../fitbit.js" 

// Class: Fitbit
// Purpose: Contains the fitbit callback page code.
const Fitbit: React.FC = () => {
  GetFitbitToken(); // get the fitbit token from the callback url
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Success</IonTitle>
        </IonToolbar>
      </IonHeader> 
      <IonContent className="ion-padding">
        <p>
          Successfully linked your Fitbit account.
        </p>
        <div style={{display:"flex", alignItems:"center",justifyContent:"center"}}>
          <IonButton href="home">
            Go Back
          </IonButton>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Fitbit;
