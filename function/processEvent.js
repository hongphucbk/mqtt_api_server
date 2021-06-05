async function processEvent(data, str_topic){
  let alarmCode = data.RegisterStatus;
  let register = data.Register;

  let arrs = []
  let arrAlarms = await Alarm.find({register: register})

  let d = {
    device : str_topic[1],
    register :  register,
    status : alarmCode,
    timestamp : new Date(),
    updated_at : new Date(),
  }

  let jsonEvent = {
    device: str_topic[1],
    register :  register,
    code: 0,
    status: 0,
    description: 'abc',
    timestamp : moment(), //.add(7, 'hours'),
    updated_at : moment(), //.add(7, 'hours'),
  }

  let arrRegister = alarmCode.toString(2).split('').reverse();
  console.log('arrN ' + arrRegister)

  let oldAlarm = await AlarmCode.findOne({device: str_topic[1], register: register})
  if (!oldAlarm) {
    AlarmCode.insertMany([d])
  }
  let arr2 = oldAlarm.status
  console.log('arr2 ' + arr2)
  for (var i = 0; i < arrRegister.length; i++) {
    if (arrRegister[i] == 0 && arr2[i] == 1) {
      console.log(i + ' - old alarm')
      await Event.findOneAndUpdate({
        device: str_topic[1], 
        register: register, 
        code: i, 
        status: 0
      },
      { status: 1,
        completed_at: moment(),
      },
      {upsert: false}
      )
    }

    if (arrRegister[i] == 1 && arr2[i] == 0) {
      // New alarm
      console.log(i +' new alarm')
      jsonEvent.code = i
      jsonEvent.description = arrAlarms[i].description
      //console.log(jsonEvent)
      await Event.insertMany([jsonEvent])
    }
    //arrRegister[i]
  }

  let clr = await AlarmCode.findOneAndUpdate({device: str_topic[1], register: register},{status: arrRegister},{upsert: true})

}