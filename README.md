# app-testing

## Current Script Logic

* Wait for page ready, identifier: COUNTRY
* Type into each field, identifier: HTML id
* Unselect input field by click on other place
* Read validation result from console log
* Check if result matched expected
* Print result and continue


## To add additional test case to the script

* Add test input to array emailtestInput\firstNameInput\lastNameInput\userNameInput
* Add expected result to array emailtestResult\firstNameResult\lastNameResult\userNameResult

## To add additional test field to the script

* Create new test input array
* Create new expected result array
* Add test input array to packtestInpunt
* Add expected result array packtestResult
* Check input field HTML id and add to testID
* Check validaiton logic and add identifier to validaitonID


## Note

* "firstName" input field is used to unselect input field under test to generate input validation result
* "firstName" and "lastName" does not have input validation logic, assumed always true
* Page assumed ready after automatic country code detection which can fail sometimes, restart if country code failed to generate
* "CHANGE" is used as identifier to check if keyboard typing finished. 

