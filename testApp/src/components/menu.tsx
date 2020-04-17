import React, {Component} from 'react';
import {IonMenu, IonHeader, IonTitle, IonToolbar, IonContent, IonItem, IonList} from '@ionic/react';



export class NavigationMenu extends Component {
    render() {
        return (
            <IonMenu contentId="my-content">
                <IonHeader>
                    <IonToolbar color="primary">
                    <IonTitle>Start Menu</IonTitle>
                    </IonToolbar>
                </IonHeader>
                <IonContent>
                    <IonList>
                        <IonItem>Home</IonItem>
                        <IonItem>Patterns</IonItem>
                        <IonItem>Settings</IonItem>
                    </IonList>
                </IonContent>
            </IonMenu>
        )
    }
}