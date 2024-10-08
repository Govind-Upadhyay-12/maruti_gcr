const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserSchema = new Schema(
  {
    name: { type: String, maxlength: 200 },
    email: { type: String, maxlength: 200, index: true },
    ip: { type: String, maxlength: 200 },
    hash: { type: String },

    salt: { type: String, maxlength: 200 },
    Department:{
      type:String
    },
    Divison:{
      type:String
    },
    status:{
      type:String,
      enum:["true","false"],
      default:"false"
    },
    phone_Number: {
      type: String,
      required:true,
    },
    staffId:{
      type:String,
      required:true
    },
    vehicleReport:[{
      type:mongoose.Schema.ObjectId,
      ref:"vehicle_inquiry"
    }],
    status: { type: Boolean, default: true, index: true },
    createdAt: { type: Date, default: Date.now, index: true },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const Admin = mongoose.model("user", UserSchema);

module.exports = Admin;
