const requestIp = require('request-ip');
const User = require('../models/User');
const UserToken = require("../models/Usertoken")
const { validPassword, generateSalt, hashPassword, generateJWT } = require('../helpers/auth');
const responseManagement = require('../helpers/responseManagement');
const httpStatus = require('http-status-codes');
const InquiryReport=require("../models/InquiryReport")
module.exports.RegisterUser=async(req,res)=>{
    try {
        const { name, email, password,Department,Divison,staffId,phone_Number } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return responseManagement.sendResponse(res, httpStatus.BAD_REQUEST, 'Email already in use');
        }

        const salt = generateSalt();
        const hash = hashPassword(password, salt);

        const newAdmin = new User({
            name,
            email,
            salt,
            hash,
            ip: req.ip, 
            Department,
            Divison,
            staffId,
            phone_Number
        });

        await newAdmin.save();
       return responseManagement.sendResponse(res, httpStatus.OK, 'user registered successfully');
    } catch (error) {
        console.error(error);
       return responseManagement.sendResponse(res, httpStatus.INTERNAL_SERVER_ERROR, 'Internal server error');
    }
}
module.exports.UserLogin=async(req,res)=>{
    console.log(req.body)
    try {
        const { email, password } = req.body;
        const req_ip = requestIp.getClientIp(req);
        const user = await User.findOne({ email: email });

        if (user && user.salt && user.hash) {
            if (validPassword(password, user.hash, user.salt)) {
                if (user.status) {
                    if (user.ip) {
                        const newObj = {
                            id: user._id,
                            name: user.name,
                            email: user.email,
                        }
                        const token = generateJWT(newObj);
                        await UserToken.create({ admin_id: user._id, token, req_ip, user_agent: req.headers['user-agent'] });
                        responseManagement.sendResponse(res, httpStatus.OK, 'Logged in successfully', { token,user });
                    } else {
                        responseManagement.sendResponse(res, httpStatus.BAD_REQUEST, 'Invalid IP address');
                    }
                } else {
                    responseManagement.sendResponse(res, httpStatus.UNAUTHORIZED, 'User is inactive');
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
}
module.exports.AllUser = async (req, res) => {
    try {
        const { draw, columns, order, start, length, search } = req.body;
        let allUsers = await User.find({});
        if (search && search.value) {
            const searchValue = new RegExp(search.value, 'i'); 
            allUsers = allUsers.filter(user => 
                searchValue.test(user.name) || 
                searchValue.test(user.email) || 
                searchValue.test(user.Department) || 
                searchValue.test(user.Division) || 
                searchValue.test(user.status)
            );
        }
        const users = allUsers.map(user => {
            const { name, email, Department, Division, status } = user.toObject();
            return { name, email, Department, Division, status };
        });
        if (order && order.length > 0) {
            const orderColumn = columns[order[0].column].data;
            const orderDir = order[0].dir === 'asc' ? 1 : -1;

            users.sort((a, b) => {
                if (a[orderColumn] < b[orderColumn]) return -1 * orderDir;
                if (a[orderColumn] > b[orderColumn]) return 1 * orderDir;
                return 0;
            });
        }

        const paginatedUsers = users.slice(parseInt(start), parseInt(start) + parseInt(length));


        return responseManagement.sendResponse(res, httpStatus.OK, 'all user', {
            draw: parseInt(draw),
            recordsTotal: allUsers.length,
            recordsFiltered: users.length, 
            data: paginatedUsers
        });
    } catch (error) {
        console.log(error);
        return responseManagement.sendResponse(res, httpStatus.INTERNAL_SERVER_ERROR, error.message);
    }
};

module.exports.CreateReport = async (req, res) => {
    try {
        const { staffId, VIN, status, component_type } = req.body;
        const report_pdf = req.file; 
        if (!staffId || !VIN || !status || !report_pdf || !component_type) {
            return responseManagement.sendResponse(res, httpStatus.BAD_REQUEST, "All fields are required");
        }
        const UserFound = await User.findOne({ staffId: staffId });
        if (!UserFound) {
            return responseManagement.sendResponse(res, httpStatus.NOT_FOUND, "No user found");
        }
        const NewInquiry = new InquiryReport({
            VIN,
            status,
            report_pdf: report_pdf.path, 
            component_type
        });
        const saved_inquiry = await NewInquiry.save();
        const NewInquiry_id = saved_inquiry._id;
        UserFound.vehicleReport.push(NewInquiry_id);
        await UserFound.save();

        return responseManagement.sendResponse(res, httpStatus.OK, "Report created successfully", { inquiryId: NewInquiry_id });
    } catch (error) {
        console.error("Error in CreateReport:", error);
        return responseManagement.sendResponse(res, httpStatus.INTERNAL_SERVER_ERROR, "An error occurred while creating the report");
    }
};
module.exports.GetAllReports = async (req, res) => {
    try {
        const { draw, start, length, order, columns } = req.body;

        let allAdmins = await User.find()
            .populate({
                path: 'vehicleReport',
                select: 'VIN status report_pdf component_type createdAt updatedAt'
            })
            .select('name email vehicleReport');
        let allReports = allAdmins.flatMap(admin => {
            return admin.vehicleReport.map(report => ({
                name: admin.name,
                email: admin.email,
                ...report.toObject()
            }));
        });

        if (order && order.length > 0) {
            const orderColumn = columns[order[0].column].data;
            const orderDir = order[0].dir === 'asc' ? 1 : -1;

            allReports.sort((a, b) => {
                if (a[orderColumn] < b[orderColumn]) return -1 * orderDir;
                if (a[orderColumn] > b[orderColumn]) return 1 * orderDir;
                return 0;
            });
        }


        const paginatedReports = allReports.slice(parseInt(start), parseInt(start) + parseInt(length));

        if (!allReports || allReports.length === 0) {
            return responseManagement.sendResponse(res, httpStatus.NOT_FOUND, "Reports not found", null);
        }

        return responseManagement.sendResponse(res, httpStatus.OK, "All reports", {
            draw: parseInt(draw),
            recordsTotal: allReports.length,
            recordsFiltered: allReports.length, 
            data: paginatedReports
        });
    } catch (error) {
        console.error("Error in GetAllReports:", error);
        return responseManagement.sendResponse(res, httpStatus.INTERNAL_SERVER_ERROR, "Internal server error", { error });
    }
};

module.exports.getFilterByName = async (req, res) => {
    try {
        let { name } = req.query;
        if (!name) {
            return responseManagement.sendResponse(res, httpStatus.BAD_REQUEST, "Name is required");
        }
        name = decodeURIComponent(name).replace(/['"]/g, "").trim();
        const filteredAdmins = await User.find({ name }).populate({
            path: 'vehicleReport',
            select: 'VIN status report_pdf component_type createdAt updatedAt'
        }).select('-salt -ip -hash -__v -createdAt -updatedAt');

        if (!filteredAdmins || filteredAdmins.length === 0) {
            return responseManagement.sendResponse(res, httpStatus.NOT_FOUND, "No reports found for the given name", null);
        }
        return responseManagement.sendResponse(res, httpStatus.OK, "Filtered reports", { filteredAdmins });
    } catch (error) {
        console.error("Error in getFilter:", error);
        return responseManagement.sendResponse(res, httpStatus.INTERNAL_SERVER_ERROR, "Internal server error", { error });
    }
};
module.exports.getFilterByComponent = async (req, res) => {
    const { component } = req.query; 
    if(!component){
        return responseManagement.sendResponse(res, httpStatus.NOT_FOUND, "no category is there"); 
    }
   try {
        const users = await User.aggregate([
            {
                $lookup: {
                    from: "vehicle_inquiries", 
                    localField: "vehicleReport",
                    foreignField: "_id",
                    as: "vehicleReports"
                }
            },
            {
                $match: {
                    "vehicleReports.component_type": component
                }
            }
        ]);

        return responseManagement.sendResponse(res, httpStatus.OK, "data",{users});
    } catch (error) {
        console.error(error);
        return responseManagement.sendResponse(res, httpStatus.INTERNAL_SERVER_ERROR, "error",{error});
    }
};
module.exports.ReportOfParticularUser=async(req,res)=>{
    try {
        const {staffId}=req.query;
        const user=await User.findOne({staffId}).populate("vehicleReport");
        if(!user){
            return responseManagement.sendResponse(res, httpStatus.NOT_FOUND, "user not found",{});
        }
        const return_data={
            name:user.name,
            vehicleReport:user.vehicleReport
  }
    return responseManagement.sendResponse(res, httpStatus.OK, "Allreports",{return_data});
    } catch (error) {
        console.log(error);
        return responseManagement.sendResponse(res, httpStatus.INTERNAL_SERVER_ERROR, "error",{error});
        
    }
}




 

