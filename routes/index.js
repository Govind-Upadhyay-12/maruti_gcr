const express = require('express');
const router = express.Router();
const auth=require("../middlewares/auth")
const authuser=require("../middlewares/userauth")
const {RegisterUser,UserLogin, AllUser, CreateReport, GetAllReports, getFilterByName,getFilterByComponent,ReportOfParticularUser,CreateModel,vehicleReport}=require("../controllers/userControllers")
const {registerAdmin,adminLogin}=require("../controllers/adminController")
const {upload}=require("../helpers/helper")
router.post('/RegisterUser',auth,RegisterUser);
router.post('/login',UserLogin)
router.post('/AllUser',AllUser)
router.post('/createreport',upload.single("file"),authuser,CreateReport)
router.post('/AllReports',auth,GetAllReports);
router.get('/filterByName',auth,getFilterByName)
router.get('/filterbyCategory',auth,getFilterByComponent);
router.post('/adminregister',registerAdmin)
router.post('/loginadmin',adminLogin)
router.get('/userreport',authuser,ReportOfParticularUser)
router.post('/createModel',CreateModel)
router.get('/vehicledetails',authuser,vehicleReport)


module.exports = router;