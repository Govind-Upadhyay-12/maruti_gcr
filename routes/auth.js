const express = require('express');
const router = express.Router();
const {RegisterUser,UserLogin}=require("../controllers/userControllers")

router.post('/RegisterUser',RegisterUser);
router.post('/login',UserLogin)


module.exports = router;