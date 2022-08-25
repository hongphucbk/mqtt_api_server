var nodemailer =  require('nodemailer'); // khai báo sử dụng module nodemailer
const path = require('path');
const AutoEmail = require('../models/AutoEmail')
const err = require('../common/err');
const ManualEmail = require('../models/ManualEmail');
const Station = require('../models/Station');
const Report = require('../models/Report');
var moment = require('moment'); // require
const mailer = require('../mailer/mailer');
const User = require('../models/User');

module.exports.sendMail = async function(req, res) {
  let manual_email_id = req.body.manual_email_id
  
  let manual_email = await ManualEmail.findById(manual_email_id)
  let station = await Station.findById(manual_email.station)
  let report = await Report.findById(manual_email.report)
  let user = await User.findById(manual_email.user)
  //console.log('manual', manual_email)

  //return
  let from = 'NTV'
  let to = user.email
  let subject = `NTV-BÁO CÁO-${report.name}`
  let body =  `
    Chào quý khách ${station.name }, <br>
    NTV New Energy gửi quý khách báo cáo ${report.name} 
    từ ngày  ${moment(manual_email.date_start).format('DD-MM-YYYY')} 
    đến ngày ${moment(manual_email.date_end).format('DD-MM-YYYY') }
    
    <br>Đính kèm là báo cáo.
    <br>
    <br>NTV New Energy.`

  let attachments = [
      {
          'filename': manual_email.file_name,
          'path':  path.join(__dirname, `../exports/reports/${manual_email.file_name}`),
          'contentType': 'application/pdf'
      },
      // {
      //     'filename': 'a.xlsx',
      //     'path':  path.join(__dirname, '../exports/a.xlsx'),
      //     'contentType': 'application/pdf'
      // }
  ]        
  await mailer.sendMail(from, to, subject, body, attachments)
  res.send({success: 1})
  return
};

// Save config setting auto email
module.exports.postSaveAutoMail = async function(req, res){
  try{
    let station_id = req.body.site_id
    //let email_to = req.body.email_to
    let run_day = req.body.run_day
    let is_active = req.body.is_active ? 1 : 0;
    let reports = req.body.reports

    // if (range > 30 || range < 1 ) {
    //   res.json(err.E41002)
    //   return
    // }

    let user = req.user;

    let update = {
      station : station_id,
      user : user,
      //email_to : email_to,
      run_day : run_day,
      is_active : is_active,
      created_at : new Date()
    }
    //console.log(req, json)

    const filter = {station: station_id, user: user._id};

    let del = await AutoEmail.deleteMany(filter);

    for (let i = 0; i < reports.length; i++) {
      const report = reports[i];
      console.log(report)
      update.report = report

      let doc = await AutoEmail.findOneAndUpdate({...filter,...{report: report}}, update, {
        new: true,
        upsert: true  // Make this update into an upsert
      });
    }

    
    let rs = await AutoEmail.find(filter)
    let rps = rs.map(e => {return e.report})

    let d = {
      reports: rps,
      run_day: run_day,
      is_active: is_active,
    }

    res.send(d)
  } catch (error) {
    res.status(500).send({error: error.message})
  }
}

module.exports.getAutoMail = async function(req, res){
  try{
    let station_id = req.query.site_id
    let user = req.user

    const filter = {station: station_id, user: user._id};

    let result = await AutoEmail.findOne(filter);

    let rs = await AutoEmail.find(filter)
    let reports = rs.map(e => {return e.report})

    let d = {
      reports: reports,
      run_day: result.run_day,
      is_active: result.is_active,
    }

    res.send(d)
  }catch (error) {
    res.status(500).send({error: error.message})
  }
  
  

};
