const { required } = require("joi")
const mongoose = require("mongoose")

const organizationSchema = new mongoose.Schema({
    businessName: {
        type: String, 
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
        trim: true
    },
    otp: {
        type: String,
    },
    otpExpiredAt: {
        type: Date
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    role: {
        type: String,
        lowercase: true,
        trim: true,
        enum: ["individual", "multi"]
    },
    industryServiceType: {
        type: String,
        trim: true
    },
    headOfficeAddress: {
        type: String,
        trim: true
    },
    city: {
        type: String,
        triim: true
    },
    state: {
        type: String,
        trim: true,
    }, 
    fullName: {
        type: String,
        trim: true
    },
    phoneNumber: {
        type: String,
        trim: true
    },
    subscriptionDuration: {
        type: String,
        default: "monthly",
    },
    subscriptionType: {
        type: String,
        default : "freemium"
    },
    subscriptionExpiredAt: {
        type: Number
    }, 
    openingTime: {
        type: String,
    },
    closingTime: {
        type: String,
    },
    workingDays: {
        type: [String],
        enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
        default: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
    },
    timezone: {
        type: String,
        default: "Africa/Lagos"
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {timestamps : true})
module.exports = mongoose.model("organizations", organizationSchema)