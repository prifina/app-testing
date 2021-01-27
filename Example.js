//lock
const EventEmitter = require('events');
const bus = new EventEmitter();

//emojy
const checkMark = "✅";
const errorMark = "❌";
const infoMark = "👉";
const warningMark = "⚠️";

//email
const emailtestInput = ["Test@Test.com","Test","Test@Test.com```"];
const emailtestResult = [true,false,false];
//firstname
const firstNameInput = ["w","John","a".repeat(20)];
const firstNameResult = [false,true,false];
//lastname
const lastNameInput = ["w","Doe","a".repeat(20)];
const lastNameResult = [false,true,false];
//username
const userNameInput = ["w","myusername123","&123&","a".repeat(20)];
const userNameResult = [false,true,false,false];


const packtestInpunt = [emailtestInput,firstNameInput,lastNameInput,userNameInput];
const packtestResult = [emailtestResult,firstNameResult,lastNameResult,userNameResult];



//testID
const testID = ["email","firstName","lastName","username"];
const validaitonID = ["EMAIL","","","USER"];

let testIndex = 0; //index of each test case for one of the test field
let testProgress = 0; //current test progress for each test field
const testTotal = 4; //total number of test

let pageReady = false;
let inputReady = false;
let inputStart = false;

let validationMode = false;
let validationModeTarget = "";
let validationModeResult = false;
let validationModeResultReady = false;

let initMode = true;

async function typeInput(browser,page){
  
  const currentid = testID[testProgress];
  const currenttestInput = packtestInpunt[testProgress];
  console.log(infoMark,"Typing ",currenttestInput[testIndex], " to ", currentid);


  //User Input --- From HTML
  await page.evaluate((id) => {
    document.querySelector('#' + id).value = '';
    document.querySelector('#' + id).select();
  },currentid);

  await page.keyboard.type(currenttestInput[testIndex]);
}

async function runTest(browser,page,targetName,targetObj){
  
  const currentid = testID[testProgress];
  //console.log("DEBUG:: currentid: " , currentid, " targetName: ", targetName); //this should match
  const currentlogResult = targetObj;
  const currenttestInput = packtestInpunt[testProgress];
  const currenttestExpectedResult = packtestResult[testProgress];
  let currenttestResult = false;


  if (currentlogResult["value"] == currenttestInput[testIndex]){

    //find result from webpage validation logic
    if (currentid == "firstName" || currentid == "lastName"){
      //those two do not have validaion
      currentTestResult = true;
    }else{
      //click on somewhere else to get the validation result
      validationMode = true;
      validationModeTarget = currentid;
      validationModeResultReady = false;
      await page.evaluate(() => {
        document.querySelector('#firstName').select();
      });

      console.log(infoMark,"Start to wait for validaiton mode result ...")
      while (validationModeResultReady == false){
        //wait here
      }

      console.log(infoMark,"validationModeResult: ",validationModeResult);
      currentTestResult = validationModeResult;
    }


    //get html if current validation failed
    if (currentTestResult == false){
      console.log(infoMark,"Start to get html ...")
      //get html
      const notificationDiv = await page.evaluate(() => {
        var testDiv = document.getElementById("blend-toast-portal-undefined");
        var subDiv = testDiv.getElementsByTagName('div');
        var returnList = [];
        for (var i =0; i < subDiv.length; i++){
          returnList.push(subDiv[i].innerHTML);
        }
        return returnList;
      });

      console.log(infoMark,"End of get html ...")
      //console.log(notificationDiv);
      console.log(warningMark," Notification: ", notificationDiv[notificationDiv.length -1 ]);
      console.log(warningMark," Notification: ", notificationDiv[notificationDiv.length -2 ]);
    }
    //console.log(checkMark, "Testing: ", currentid, ": ", currenttestInput[testIndex]);
    if (currentTestResult == currenttestExpectedResult[testIndex]){
      console.log(checkMark,"Pass.")
    }else{
      console.log(errorMark,"Failed, Expecting: ", currenttestExpectedResult[testIndex]);
      console.log(infoMark, currentlogResult);
    }

    testIndex = testIndex + 1;
    //console.log("DEBUG: testIndex: ", testIndex);
    //console.log("DEBUG: testProgress: ", testProgress);
    //console.log("DEBUG: currenttestInput.length: ", currenttestInput.length);

    if (testIndex == currenttestInput.length){
      //goto next test or end
      testProgress = testProgress + 1;
      testIndex = 0;
      //console.log("DEBUG: testIndex: ", testIndex);
      //console.log("DEBUG: testProgress: ", testProgress);
      if (testProgress == testTotal){
        //console.log("DEBUG: I am going to close it ....");
        browser.close();
      }

    }

    if (inputReady == false || inputStart == false){
      //console.log("DEBUG:: Into Locked ...");
      await new Promise(resolve => bus.once('unlocked', resolve));
      //console.log("DEBUG:: Out of Locked ...");
    }


    //ack for new test
    inputReady = false;
    //call type input here to allow the next to move on ...
    //console.log("DEBUG:: call type input here to allow the next to move on");
    await typeInput(browser,page);
    inputReady = true;
    bus.emit('unlocked');


  }// end of if type finished
  else{
    //console.log("DEBUG:: Writing too fast ...");
  }
}

(async () => {

  const puppeteer = require('puppeteer');
  const browser = await puppeteer.launch({headless:false});
  const page = await browser.newPage();
  page.setDefaultNavigationTimeout(100000)
  await page.goto('http://alpha.app.prifina.com/register');
  
  //Screenshot supported
  //await page.screenshot({path: 'example.png'});
  
  page.on('console', async msg => {

    //console.log("Log Type: ", msg.type())
    
    const args = await Promise.all(msg.args().map(a => a.jsonValue())).catch({
      //something
    });

    if (initMode){
      console.log(infoMark, "Init Mode: ", args[0]);
    }


    if (args[0].includes("COUNTRY")){
      pageReady = true;
      initMode = false;
      console.log(infoMark,"Page is ready"); //This is to wait for the auto country code
    }

    //console.log(args[0]);
    //console.log(validationMode);
    if (validationMode && args[0].includes(validaitonID[testProgress])){
      //get the last element as result
      let argn = 0;
      while (args[argn] != undefined){
        argn = argn + 1;
      }

      // console.log(args[0]);
      // console.log(args[1]);
      // console.log(args[2]);
      // console.log(args[3]);

      validationModeResult = args[argn - 1];
      validationModeResultReady = true;
      validationMode = false;

      //the result for username is reverse ...
      if (validaitonID[testProgress] == "USER"){
        validationModeResult = validationModeResult ? false : true;
      }

      return;
    }


    if (pageReady && inputReady == false && inputStart == false){ //allow only the first one
      //console.log("DEBUG:: Trying to type");
      inputStart = true;
      await typeInput(browser,page);
      inputReady = true;
      bus.emit('unlocked');
    }

    // console.log("inputReady", inputReady);
    // console.log("pageReady", pageReady);
    // console.log("args[0]", args[0]);

    if (pageReady && args[0].includes("CHANGE")){
      
      const targetName = args[1];
      const targetObj = args[2];

      //console.log("DEBUG:: Trying to runTest");
      await runTest(browser,page,targetName,targetObj);

    }
  });

  // page.mainFrame()
  //   .waitForTimeout(10000000)
  //   .then(() => browser.close());

})();


process.on('unhandledRejection', (reason) => {
  //console.log('DEBUG: ' + reason);
});
