const express = require("express")
const router = express.Router()
const {
    registerOrganization,
    verifyOtp,
    loginOrganization,
    changePassword,
    getOrganizations,
    getOrganizationById,
    deleteOrganization
} = require("../controller/organizationController")
const {registerValidator, verifyValidator} = require("../middleware/validation")

router.post("/register", registerValidator, registerOrganization)
router.post("/verify-otp", verifyValidator, verifyOtp)
router.post("/login", loginOrganization)
router.put("/change-password", changePassword)
router.get("/organizations", getOrganizations)
router.get("/organizations/:organizationId", getOrganizationById)
router.delete("/organizations/:organizationId", deleteOrganization)

module.exports = router