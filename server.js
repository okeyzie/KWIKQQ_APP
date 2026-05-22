require("dotenv").config()

const app = require("./app")
const {connectDB} = require("./config/database")
const PORT = process.env.PORT || 3232

connectDB()

app.listen (PORT, () =>{
    console.log(`Server is running on Port: ${PORT}`)
})