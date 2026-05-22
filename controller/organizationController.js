const organizationModel = require("../models/organizationModel")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const { sendMail } = require("../utils/emailService")

exports.registerOrganization = async (req, res)=>{
    try {
        const { businessName, email, password, role } = req.body
        
        if (!businessName || !email || !password || !role) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            })
        }

        if (!["individual", "multi"].includes(role.toLowerCase())) {
            return res.status(400).json({
                success: false,
                message: "role must be either 'individual' or 'multi'"
            })
        }

        const existingEmail = await organizationModel.findOne({ email })
        const existingBusinessName = await organizationModel.findOne({ businessName })
        if (existingEmail || existingBusinessName) {
            return res.status(409).json({
                success: false,
                message: "Organization with this already exists"
            })
        }
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)
        const otp = Math.round(Math.random() * 1e6).toString().padStart(6, "0")

        const newOrganization = new organizationModel({
            businessName,
            email,
            password: hashedPassword,
            otp: otp,
            otpExpiredAt: new Date(Date.now() + 10 * 60 * 1000),
            role: role
        })

        const detail = {
            email: newOrganization.email,
            subject: "Verify your KwikQ account",
            text: `Your OTP for verifying your KwikQ account is ${otp}. It will expire in 10 minutes.`,            
        }
        await sendMail(detail)
        
        await newOrganization.save()

        res.status(201).json({
            success: true,
            message: "Organization registered successfully",
            data: {
                id: newOrganization._id,
                businessName: newOrganization.businessName,
                email: newOrganization.email,
                role: newOrganization.role,
            }
        })

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "An error occurred while registering the organization",
            error: error.message
        })
    }
}

exports.verifyOtp = async (req, res) => {
    try {
        const { email, otp } = req.body

        if (!email || !otp) {
            return res.status(400).json({
                success: false,
                message: "Email and OTP are required"
            })
        }

        const organization = await organizationModel.findOne({ email })

        if (!organization) {
            return res.status(404).json({
                success: false,
                message: "Organization not found"
            })
        }

        if (organization.isVerified) {
            return res.status(400).json({
                success: false,
                message: "Organization is already verified"
            })
        }

        if (organization.otp !== otp) {
            return res.status(400).json({
                success: false,
                message: "Invalid OTP"
            })
        }

        if (new Date() > organization.otpExpiredAt) {
            return res.status(400).json({
                success: false,
                message: "OTP has expired"
            })
        }

        organization.isVerified = true
        organization.otp = null
        organization.otpExpiredAt = null

        await organization.save()

        res.status(200).json({
            success: true,
            message: "Organization verified successfully",
            data: {
                id: organization._id,
                businessName: organization.businessName,
                email: organization.email,
                role: organization.role,
                isVerified: organization.isVerified
            }
        })

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "An error occurred while verifying OTP",
            error: error.message
        })
    }
}

exports.loginOrganization = async (req, res) => {
    try {
        const { email, password } = req.body

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required"
            })
        }

        const organization = await organizationModel.findOne({ email })

        if (!organization) {
            return res.status(404).json({
                success: false,
                message: "Invalid email or password"
            })
        }

        const isMatch = await bcrypt.compare(password, organization.password)
        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: "Invalid email or password"
            })
        }

        const payload = {
            id: organization._id,
            email: organization.email,
            role: organization.role
        }

        const token = jwt.sign(payload, process.env.JWT_SECRET || "default_jwt_secret", { expiresIn: "3h" })

        res.status(200).json({
            success: true,
            message: "Login successful",
            token: token,
            data: {
                id: organization._id,
                email: organization.email,
            }
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "An error occurred while logging in",
            error: error.message
        })
    }
}

exports.changePassword = async (req, res) => {
    try {
        const { email, currentPassword, newPassword } = req.body

        if (!email || !currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            })
        }

        const organization = await organizationModel.findOne({ email })

        if (!organization) {
            return res.status(404).json({
                success: false,
                message: "Organization not found"
            })
        }

        const isMatch = await bcrypt.compare(currentPassword, organization.password)
        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: "Incorrect password"
            })
        }

        if (newPassword === currentPassword) {
            return res.status(400).json({
                success: false,
                message: "New password must be different from current password"
            })
        }

        organization.password = await bcrypt.hash(newPassword, 10)
        await organization.save()

        res.status(200).json({
            success: true,
            message: "Password changed successfully"
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "An error occurred while changing password",
            error: error.message
        })
    }
}

exports.getOrganizations = async (req, res) => {
    try {
        const organizations = await organizationModel.find().select("-password")
        res.status(200).json({
            success: true,
            data: organizations
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "An error occurred while fetching organizations",
            error: error.message
        })
    }
}

exports.getOrganizationById = async (req, res) => {
    try {
        const { organizationId } = req.params
        const organization = await organizationModel.findById(organizationId).select("-password")

        if (!organization) {
            return res.status(404).json({
                success: false,
                message: "Organization not found"
            })
        }

        res.status(200).json({
            success: true,
            data: organization
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "An error occurred while fetching the organization",
            error: error.message
        })
    }
}

exports.deleteOrganization = async (req, res) => {
    try {
        const { organizationId } = req.params
        const organization = await organizationModel.findByIdAndDelete(organizationId)

        if (!organization) {
            return res.status(404).json({
                success: false,
                message: "Organization not found"
            })
        }

        res.status(200).json({
            success: true,
            message: "Organization deleted successfully"
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "An error occurred while deleting the organization",
            error: error.message
        })
    }
}

exports.resendOtp = async (req, res) => {
    try {
        const { email } = req.body
        const organization = await organizationModel.findOne({ email: email.toLowerCase() })

        if (!organization) {
            return res.status(404).json({
                success: false,
                message: "Organization not found"
            })
        }

        const otp = Math.round(Math.random() * 1e6).toString().padStart(6, "0")
        organization.otp = otp
        organization.otpExpiredAt = new Date(Date.now() + 10 * 60 * 1000)
        await organization.save()

        const detail = {
            email: organization.email,
            subject: "Resend: Email Verification",
            text: `Your new OTP is ${otp}. It will expire in 10 minutes.`
        }

        await sendMail(detail)

        res.status(200).json({
            success: true,
            message: "OTP resent successfully"
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "An error occurred while resending OTP",
            error: error.message
        })
    }
}