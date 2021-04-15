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


const client = mqtt.connect('mqtt://113.161.79.146:5000', options );

client.on("connect", ack => {
  console.log("MQTT Client Connected!");
  client.subscribe('inverterB/power');

  client.on("message", (topic, message) => {
    console.log(`MQTT Client Message.  Topic: ${topic}.  Message: ${message.toString()}`);

    let a = JSON.parse("{'value': 6000, 'unit': 'W', 'dataType': 'uint16', 'timeStamp': '2021-04-11 14:09:40.959970'} ") //JSON.parse(message.toString());
    console.log(a)
  });
});

client.on("error", err => {
  console.log(err);
});