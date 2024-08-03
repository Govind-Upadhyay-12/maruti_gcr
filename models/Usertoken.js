const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const userTokenSchema = new Schema({
    admin_id: { type: Schema.Types.ObjectId, ref: 'user', index: true },
    token: { type: String },
    req_ip: { type: String },
    user_agent: { type: String },
    createdAt: { type: Date, default: Date.now, index: true },
    updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

const AdminToken = mongoose.model('UserToken', userTokenSchema);

module.exports = AdminToken;