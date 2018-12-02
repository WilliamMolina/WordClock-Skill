'use strict';
const Alexa = require('alexa-sdk');
const mqtt = require('mqtt');

//=========================================================================================================================================
//TODO: The items below this comment need your attention.
//=========================================================================================================================================

//Replace with your app ID (OPTIONAL).  You can find this value at the top of your skill's page on http://developer.amazon.com.
//Make sure to enclose your value in quotes, like this: const APP_ID = 'amzn1.ask.skill.bb4045e6-b3e8-4133-b650-72923c5980f1';
const APP_ID = 'amzn1.ask.skill.1bbed508-f3e8-42e5-9cdf-aecaa573e307';

const SKILL_NAME = 'Word Clock';
const es = {
    DEFAULT_SCREEN: 'la pantalla de la sala',
    OPENING_MESSAGE: 'Abriendo ',
    HELP_MESSAGE: 'Simplemente di "Abre word clock"',
    STOP_MESSAGE: 'Adios!',
    LOCATION: ' en '
};
const en = {
    DEFAULT_SCREEN: 'livingroom screen',
    OPENING_MESSAGE: 'Opening ',
    HELP_MESSAGE: 'Simply say "Open word clock"',
    STOP_MESSAGE: 'Goodbye!',
    LOCATION: ' in '
};

const globalResourceData = {
    'en-US': en,
    'en-GB': en,
    'en-CA': en,
    'en-IN': en,
    'en-AU': en,
    'es-ES':es,
    'es-MX':es
};

function resourceData(request) {
    let DEFAULT_LOCALE = 'en-US';
    if (request !== undefined && request.locale !== undefined) {
        var locale = request.locale;
    }
    else {
        var locale = DEFAULT_LOCALE;
    }
    return globalResourceData[locale];
}

//=========================================================================================================================================
//TODO: Replace this data with your own.  You can find translations of this data at http://github.com/alexa/skill-sample-node-js-fact/data
//=========================================================================================================================================
const widget = {'name':'widget-todays-date', 'description':'Word Clock'};
//=========================================================================================================================================
//Editing anything below this line might break your skill.
//=========================================================================================================================================

const handlers = {
    'LaunchRequest': function () {
        this.emit('OpenWordClockIntent');
    },
    'OpenWordClockIntent': function () {
        var options={
            retain:false,
            qos:1
        };
        var request = this.event.request;
        const locale = resourceData(request);
        var screen = this.event.request.intent ? this.event.request.intent.slots.screen.value : locale.DEFAULT_SCREEN;
        var respon = this.response;
        var emit = this.emit;
        var client  = mqtt.connect("mqtt://iot.eclipse.org",{clientId:"mqttjs0109843"});
        client.on("connect",function(){                        
            const speechOutput = locale.OPENING_MESSAGE + widget.description + locale.LOCATION+ screen;
            client.publish('dashboard',widget.name,options);
            respon.cardRenderer(SKILL_NAME, locale.OPENING_MESSAGE + widget.description + locale.LOCATION + screen);            
            respon.speak(speechOutput);
            emit(':responseReady');
            client.end();
        });       
    },
    'AMAZON.HelpIntent': function () {
        var request = this.event.request;
        const locale = resourceData(request);
        const speechOutput = locale.HELP_MESSAGE;
        const reprompt = locale.HELP_MESSAGE;
        this.response.speak(speechOutput).listen(reprompt);
        this.emit(':responseReady');
    },
    'AMAZON.CancelIntent': function () {
        var request = this.event.request;
        const locale = resourceData(request);
        this.response.speak(locale.STOP_MESSAGE);
        this.emit(':responseReady');
    },
    'AMAZON.StopIntent': function () {
        var request = this.event.request;
        const locale = resourceData(request);
        this.response.speak(locale.STOP_MESSAGE);
        this.emit(':responseReady');
    },
};

exports.handler = function (event, context, callback) {
    const alexa = Alexa.handler(event, context, callback);
    alexa.APP_ID = APP_ID;
    alexa.registerHandlers(handlers);
    alexa.execute();
};
