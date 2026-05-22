const mongoose = require("mongoose")

mongoose.set("debug", process.env.NODE_ENV === "development")

let isDBConnected = false 
const connectDB = async () =>{
    try {
        await mongoose.connect(process.env.DB_URI, {})
        isDBConnected = true
        console.log("Database connected successfully")
    } catch (error) {
        isDBConnected = false
        console.error("Database connection failed:", error.message)
    }
}

mongoose.connection.on("disconnected", () => {
  isDBConnected = false;
  console.error("Database disconnected");
});

mongoose.connection.on("reconnected", () => {
  isDBConnected = true;
  console.log("Database reconnected");
});

const checkDB = () => isDBConnected;

module.exports = { connectDB, checkDB };