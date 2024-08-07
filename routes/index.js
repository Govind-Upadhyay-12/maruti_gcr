const express = require('express');
const router = express.Router();
const auth=require("../middlewares/auth")
const {RegisterUser,UserLogin, AllUser, CreateReport, GetAllReports, getFilterByName,getFilterByComponent}=require("../controllers/userControllers")
const {registerAdmin,adminLogin}=require("../controllers/adminController")

router.post('/RegisterUser',RegisterUser);
router.post('/login',UserLogin)
router.get('/AllUser',auth,AllUser)
router.post('/createreport',auth,CreateReport)
router.get('/AllReports',auth,GetAllReports);
router.get('/filterByName',auth,getFilterByName)
router.get('/filterbyCategory',auth,getFilterByComponent);
router.post('/adminregister',registerAdmin)
router.post('/loginadmin',adminLogin)


module.exports = router;