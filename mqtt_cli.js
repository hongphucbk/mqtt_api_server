require('dotenv').config();
// Mqtt
const mqtt = require('mqtt');
var options = {
    port: 5000,
    //host: 'mqtt://m11.cloudmqtt.com',
    username: 'iot2021',
    password: 'iot2021',
};

//var client = mqtt.connect('mqtt://m11.cloudmqtt.com', options);
const DeviceData = require('./models/DeviceData')
//const client = mqtt.connect('mqtt://113.161.79.146:5000', options );
const client = mqtt.connect(process.env.MQTT_URL, options );

client.on("connect", ack => {
  console.log("MQTT Client Connected!");
  //client.subscribe('inverterB/power');

  client.on("message", (topic, message) => {
    console.log(`MQTT Client Message.  Topic: ${topic}.  Message: ${message.toString()}`);

    
  });

  let str = '{"activeEvents": [{"event": "UNDER_TEMP", "eventID": 14, "Type": "Alarm", "timeStamp": "2021-05-31 15:46:53.431452"}], ' 
          + '"Register": 1, "RegisterStatus": '+ 11 +'}'
  client.publish('SOLAR/60c0f3182227a817a8e39edb/reportEvent1', str)

});

client.on("error", err => {
  console.log(err);
});