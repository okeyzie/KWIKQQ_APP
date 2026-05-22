const express = require("express")
const cors = require("cors")
const organizationRouter = require("./routes/organizationRouter")

const app = express()
app.use(express.json())
app.use(cors())

app.get("/", (req,res) => {
    res.status(200).json({
        status: "success",
        message: "KwikQ is Live"
    })
})
app.use("/api/v1", organizationRouter)
module.exports = app