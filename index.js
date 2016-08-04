/**
    Copyright 2014-2015 Amazon.com, Inc. or its affiliates. All Rights Reserved.

    Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with the License. A copy of the License is located at

        http://aws.amazon.com/apache2.0/

    or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

/**
 * This simple sample has no external dependencies or session management, and shows the most basic
 * example of how to create a Lambda function for handling Alexa Skill requests.
 *
 * Examples:
 * One-shot model:
 *  User: "Alexa, tell Greeter to say hello"
 *  Alexa: "Hello World!"
 */

/**
 * App ID for the skill
 */
var APP_ID = "amzn1.ask.skill.ba3cf1f3-b22f-456b-abc2-99b015f95216"; //replace with "amzn1.echo-sdk-ams.app.[your-unique-value-here]";

/**
 * The AlexaSkill prototype and helper functions
 */
var AlexaSkill = require('./AlexaSkill');
var urlPrefix = 'http://api.globalquran.com/ayah/';
var http = require('http');

/**
 * HelloWorld is a child of AlexaSkill.
 * To read more about inheritance in JavaScript, see the link below.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Introduction_to_Object-Oriented_JavaScript#Inheritance
 */
var HelloWorld = function () {
    AlexaSkill.call(this, APP_ID);
};

// Extend AlexaSkill
HelloWorld.prototype = Object.create(AlexaSkill.prototype);
HelloWorld.prototype.constructor = HelloWorld;

HelloWorld.prototype.eventHandlers.onSessionStarted = function (sessionStartedRequest, session) {
    console.log("HelloWorld onSessionStarted requestId: " + sessionStartedRequest.requestId
        + ", sessionId: " + session.sessionId);
    // any initialization logic goes here
};

HelloWorld.prototype.eventHandlers.onLaunch = function (launchRequest, session, response) {
    console.log("HelloWorld onLaunch requestId: " + launchRequest.requestId + ", sessionId: " + session.sessionId);
    var speechOutput = "Greetings! Please ask me to Read a verse from the Holy Koran. You may ask, read chapter fifteen verse ten.";
    var repromptText = "Please specify the Chapter and Verse Number! You may ask, read chapter fifteen verse ten.";
    response.ask(speechOutput, repromptText);
};

HelloWorld.prototype.eventHandlers.onSessionEnded = function (sessionEndedRequest, session) {
    console.log("HelloWorld onSessionEnded requestId: " + sessionEndedRequest.requestId
        + ", sessionId: " + session.sessionId);
    // any cleanup logic goes here
};

HelloWorld.prototype.intentHandlers = {
    // register custom intent handlers
    "HolyQuranIntent": function (intent, session, response) {
        handleFirstEventRequest(intent, session, response);
    },
    "AMAZON.HelpIntent": function (intent, session, response) {
        response.ask("Please specify the Chapter and Verse Number! You may ask, read chapter fifteen verse ten.");
    }
};

function handleFirstEventRequest(intent, session, response) {
    //var daySlot = intent.slots.day;
    var verseSlot = intent.slots.Verse.value;
    var chapterSlot = intent.slots.Chapter.value;
	console.log("Verse No: " + verseSlot);
	console.log("Chapter No: " + chapterSlot);	
	
	var sessionAttributes = {};
    getVerse(chapterSlot, verseSlot, function (verse) {
        var speechText = "";
		console.log("Verse = " + verse);
		console.log("Verse Length = " + verse.length);
        if (verse.length == 0) {
            speechText = "There is a problem connecting to Online Koran at this time. Please try again later.";
            cardContent = speechText;
            response.tell(speechText);
        } else {
            cardContent = speechText;
            response.tell(verse);
        }
    });
}

function getVerse(chapter, verse, eventCallback) {
    var url = urlPrefix + chapter + ':' + verse + '/en.sahih';

    http.get(url, function(res) {
        var body = '';

        res.on('data', function (chunk) {
            body += chunk;
        });

        res.on('end', function () {
            var stringResult = parseJson(body);
            eventCallback(stringResult);
        });
    }).on('error', function (e) {
        console.log("Got error: ", e);
    });
}

function parseJson(inputText) {
	console.log("JSON Input: ", inputText);
    // sizeOf (/nEvents/n) is 10
	var text1 = inputText.substring(inputText.indexOf("verse")+7);
	text1.replace("}}}}","");
	console.log("Ret String: ", text1);
	return text1;
}

// Create the handler that responds to the Alexa Request.
exports.handler = function (event, context) {
    // Create an instance of the HelloWorld skill.
    var helloWorld = new HelloWorld();
    helloWorld.execute(event, context);
};

