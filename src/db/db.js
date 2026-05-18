import mongoose from "mongoose";
import { VID_DB } from "../Constants";

const connectDB = async () => {
    try{
        const connectionInstance= await mongoose.connect (`${process.env.MONGODB_URL}/${VID_DB}`)
        console.log(`Connected to MongoDB successfully, DB HOST:  ${connectionInstance.connection.host}`)
    }
    catch(error){
        console.error("Error occurred:", error);
        process.exit(1)
    }
}

export default connectDB;