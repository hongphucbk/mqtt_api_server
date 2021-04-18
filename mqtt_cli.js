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


const client = mqtt.connect('mqtt://113.161.79.146:5000', options );

client.on("connect", ack => {
  console.log("MQTT Client Connected!");
  client.subscribe('inverterB/power');

  client.on("message", (topic, message) => {
    console.log(`MQTT Client Message.  Topic: ${topic}.  Message: ${message.toString()}`);

    let data = JSON.parse(message.toString()) //JSON.parse(message.toString());
    data.device = "607c3b277fafb40680689401"
    data.paras = "power"
    console.log(data)

    let dt = new DeviceData(data)
    dt.save();
    //DeviceData.insertMany([data])
  });
});

client.on("error", err => {
  console.log(err);
});