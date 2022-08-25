require('dotenv').config();
var moment = require('moment'); // require
const axios = require('axios');
const delay = require('delay');
var fs = require("fs");
var path = require("path");

//-------------------------------------------------------------------
var mongoose = require('mongoose');
mongoose.connect(process.env.MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true});

const User = require('../../models/User')
const Station = require('../../models/Station')
const auth = require('../../middlewares/auth')
const role = require('../../middlewares/role')
const Device = require('../../models/Device')
const DeviceData = require('../../models/DeviceData')
const HistoryDeviceData = require('../../models/HistoryDeviceData')
const HistoryStationData = require('../../models/HistoryStationData')
const WhDeviceData = require('../../models/WhDeviceData')
const WDeviceData = require('../../models/WDeviceData')
const LoadStationData = require('../../models/LoadStationData')
const StationData = require('../../models/StationData')
const LoadWStationData = require('../../models/LoadWStationData')
const LoadWhStationData = require('../../models/LoadWhStationData')
const WhDeviceData3 = require('../../models/WhDeviceData3')
const WhStation3Price = require('../../models/WhStation3Price')
const BillingSchedule = require('../../models/BillingSchedule');
const Invoice = require('../../models/Invoice.model');
const IndexStation = require('../../models/IndexStation');
const AutoEmail = require('../../models/AutoEmail');
//const Customer = require('../../models/Customer.model');
const mailer = require('../../mailer/mailer');
const Report = require('../../models/Report');


//calc_report(moment())

//=======================================================
async function calc_report(date){
  try{
    let auto_emails = await AutoEmail.find({is_active: 1})

    console.log(auto_emails)
    if (auto_emails.length < 1) {
      return
    }

    for (var i = 0; i < auto_emails.length; i++) {
      await delay(1000);

      let auto_email = auto_emails[i]       
      if(auto_email.run_day == "Last"){
        auto_email.run_day = moment().endOf("month").date()
      }
      console.log(auto_email.run_day , moment().date())

      if(auto_email.run_day == moment().date()){
        let date_start = moment().subtract(1, 'months').startOf('day');
        let date_end = moment().subtract(1, 'day').startOf('day');
        let date_run = moment().startOf('day');
        

        
        const res = await axios.get(`http://127.0.0.1:5001/report/download/auto/${auto_email._id}`,{
          // site_id: site_id,
          // date_start: date_start,
          // date_end : date_end,
        });
        console.log(res.data)
        await delay(200);
        let file_name = res.data.file_name
        let rs = await AutoEmail.findByIdAndUpdate(auto_email._id, {date_end, date_start, date_run, file_name})


        //console.log(res1)
      }
    }
      
  }catch(error){
    console.log(error)
  }
}

//=======================================================
// my function


//===================================================
async function calc_report_send_mail(date){
  try{
    let strDate = moment(date).startOf('day')
    let auto_emails = await AutoEmail.find({date_run: strDate})
    console.log(auto_emails.length)

    if (auto_emails.length < 1) {
      return
    }
    for (var i = 0; i < auto_emails.length; i++) {
      let auto_email = auto_emails[i] 
      console.log(auto_email, moment().date())
      await delay(1000)
      
      //if(auto_email.run_day == moment().date()){
      let station = await Station.findById(auto_email.station)
      let report = await Report.findById(auto_email.report)

      let from = 'NTV'
      let to = auto_email.email_to
      let subject = `NTV-BÁO CÁO-${report.name}`
      let body =  `
        Chào quý khách ${station.name }, <br>
        NTV New Energy gửi quý khách báo cáo ${report.name} 
        từ ngày ${moment(auto_email.date_start).format('DD-MM-YYYY')} 
        đến ngày ${moment(auto_email.date_end).format('DD-MM-YYYY') }
        
        <br>Đính kèm là báo cáo.
        <br>
        <br>NTV New Energy.`

      let attachments = [
          {
              'filename': auto_email.file_name,
              'path':  path.join(__dirname, `../../exports/reports/${auto_email.file_name}`),
              'contentType': 'application/pdf'
          },
          // {
          //     'filename': 'a.xlsx',
          //     'path':  path.join(__dirname, '../exports/a.xlsx'),
          //     'contentType': 'application/pdf'
          // }
      ]        
      await mailer.sendMail(from, to, subject, body, attachments)
      // Quá trình gửi email thành công thì gửi về thông báo success cho người dùng
      
    }
    return ('<h3>Your email has been sent successfully.</h3>')
  }catch(error){
    console.log(error)
  }
}

//========================================

//========================================
//calc_report_send_mail(moment())

module.exports = { calc_billing, calc_invoice_send_mail }

  