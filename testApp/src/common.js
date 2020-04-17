/*
* File          : common.js
* Project       : Capstone
* Programmer    : Emily Goodwin
* First Version : April 14, 2020
* Description   : Contains common functions.
*/

/*
* Method:       formatNumber
* Description:  format the given number to be prefixed with a 0 if less than 10
* Params:       
*   number - the number to format
* Return:       the formatted number as a string
*/
export function formatNumber(number) {
    var string = number.toString();
    if ((number > 0) && (number < 10))
    {
        string = "0" + string;
    }
    return string
}