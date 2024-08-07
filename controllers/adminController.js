const Admin = require("../models/Admin");
const AdminToken = require("../models/AdminToken");
const responseManagement = require('../helpers/responseManagement');
const { validPassword, generateSalt, hashPassword, generateJWT } = require('../helpers/auth');
const httpStatus = require('http-status-codes')
const requestIp = require('request-ip');
module.exports.registerAdmin = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        const existingAdmin = await Admin.findOne({ email });
        if (existingAdmin) {
            return responseManagement.sendResponse(res, httpStatus.BAD_REQUEST, 'Email already in use');
        }

        const salt = generateSalt();
        const hash = hashPassword(password, salt);

        const newAdmin = new Admin({
            name,
            email,
            salt,
            hash,
            ip: req.ip
        });

        await newAdmin.save();
        responseManagement.sendResponse(res, httpStatus.CREATED, 'Admin registered successfully');
    } catch (error) {
        console.error(error);
        responseManagement.sendResponse(res, httpStatus.INTERNAL_SERVER_ERROR, 'Internal server error');
    }
};
module.exports.adminLogin = async (req, res) => {
    try {
        const { email, password } = req.body;
        const req_ip = requestIp.getClientIp(req);
        const admin = await Admin.findOne({ email });

        if (admin && admin.salt && admin.hash) {
            if (validPassword(password, admin.hash, admin.salt)) {
                if (admin.status) {
                    if (admin.ip) {
                        const newObj = {
                            id: admin._id,
                            name: admin.name,
                            email: admin.email,
                        }
                        const token = generateJWT(newObj);
                        await AdminToken.create({ admin_id: admin._id, token, req_ip, user_agent: req.headers['user-agent'] });
                        responseManagement.sendResponse(res, httpStatus.OK, 'Logged in successfully', { token, admin });
                    } else {
                        responseManagement.sendResponse(res, httpStatus.BAD_REQUEST, 'Invalid IP address');
                    }
                } else {
                    responseManagement.sendResponse(res, httpStatus.UNAUTHORIZED, 'Admin is inactive');
                }
            } else {
                responseManagement.sendResponse(res, httpStatus.BAD_REQUEST, 'Invalid credentials');
            }
        } else {
            responseManagement.sendResponse(res, httpStatus.BAD_REQUEST, 'Invalid credentials');
        }
    } catch (error) {
        console.error(error);
        responseManagement.sendResponse(res, httpStatus.INTERNAL_SERVER_ERROR, 'Internal server error');
    }
};
