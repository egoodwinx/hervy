## HeRVY
HeRVY is a mobile web application used to track anxiety through heart rate data. HeRVY integrates with Fitbit to gather wearable data over time. It can track anxiety patterns by the hour both daily and weekly. Anxiety is tracked using an algorithm derived from PhysioNet’s Non-EEG heart rate data. 

## Why?
HeRVY is a proof-of-concept research project regarding tracking heart rate data to determine anxiety levels, based on a mobile application that would allow users to track their anxiety levels over time and tell when the user is anxious. The target audience would be vulnerable persons who have trouble communicating their feelings or needs, or those who want to track their ongoing medical professional help.

## Project Website!
https://goodwinyemily.wixsite.com/hervy

<b>Built with</b>
- [CherryPy](https://cherrypy.org/)
- [Ionic Framework 5.4.16](https://ionicframework.com/docs/)
- [React](https://reactjs.org/)
- [Fitbit](https://dev.fitbit.com/build/reference/web-api/)
- [Okta](https://www.okta.com/)
- [Python 3.7.6](https://www.python.org/)

## Installation
1.  >git clone https://github.com/egoodwinx/hervy.git
2.  >cd ./hervy/testApp/src
3.  >echo.>private_config.js
4. Copy and paste the following into the newly created private_config.js file (using your own information):
```
export var FITBIT_ID = "xxxx";
export var FITBIT_SECRET = "xxxx";
export var OKTA_ID = "xxxx";
export var OKTA_SECRET = "";
```
## Running
Needs to have both the testApp for the front-end display and python service application running.
1. > cd ./hervy/testApp
2. > ionic serve
In another console...
1. > cd ./hervy/python_service
2. > python webService.py