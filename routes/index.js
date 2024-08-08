const express = require('express');
const router = express.Router();
const auth=require("../middlewares/auth")
const {RegisterUser,UserLogin, AllUser, CreateReport, GetAllReports, getFilterByName,getFilterByComponent}=require("../controllers/userControllers")
const {registerAdmin,adminLogin}=require("../controllers/adminController")
const {upload}=require("../helpers/helper")
router.post('/RegisterUser',auth,RegisterUser);
router.post('/login',UserLogin)
router.post('/AllUser',auth,AllUser)
router.post('/createreport',upload.single("file"),auth,CreateReport)
router.get('/AllReports',auth,GetAllReports);
router.get('/filterByName',auth,getFilterByName)
router.get('/filterbyCategory',auth,getFilterByComponent);
router.post('/adminregister',registerAdmin)
router.post('/loginadmin',adminLogin)


module.exports = router;