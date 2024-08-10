const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const VehicleInquiryReport = new Schema({
   VIN:{
    type:String,
    required:true,
   },
   status:{
    type:String,
    enum:["ok","not ok"]
   },
   report_pdf:{
    type:String,
   },
   component_type:{
    type:String,
    enum:["break","ac hose","wheel","stering"]
   },
   ModelNo:{
    type:String,
   },
   VehicleDetails: {
      type: [String], 
    },

}, { timestamps: true });

const VehicleInquiryReport_Schema = mongoose.model('vehicle_inquiry', VehicleInquiryReport);

module.exports = VehicleInquiryReport_Schema