import dotenv from "dotenv"
import connectDB from "./db/db";
import { error } from "three";

dotenv.config({
    path: "./.env"
});

connectDB()
.then(()=>{
    app.listen(process.env.PORT || 8000,()=>{
        console.log(`Server is running on port ${process.env.PORT || 8000}`)
    })
})

.catch((error=>{
    console.log("DB connection failed!",error)
}))

/*
import express from "express";

const app=express();

; ( async()=>{
    try{
        await mongoose.connect (`${process.env.MONGODB_URL}/${VID_DB}`)
        app.on("error", (error) => {
            console.error("Error occurred:", error)
            throw error
        })

        app.listen(process.env.PORT, () => {
            console.log(`Server is running on port ${process.env.PORT}`)
        })
    } catch(error){
        console.error("Error occurred:", error);
        throw error;
    }
} ) ( )
*/