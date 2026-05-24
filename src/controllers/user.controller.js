import {asyncHandler} from '../utils/asyncHandler.js';
import {ApiError} from '../utils/ApiError.js';
import {User} from '../models/user.model.js';
import {uploadToCloudinary} from '../utils/cloudinary.js';
import {ApiResponse} from '../utils/ApiResponse.js';


const registerUser=asyncHandler(async(req,res)=>{
    //get user details from frontend
    //validate user details
    //check if user already exists
    //check for images check for avatar and upload to cloudinary
    //create user in database
    //remove password and refresh token from response
    //return response to frontend

    const{fullName,email,username,password}=req.body;

    console.log(fullName,email,username,password);

    if(fullName=="")
    {
        throw new ApiError(400,"Full name is required");
    }
    if(email=="")
    {
        throw new ApiError(400,"Email is required");
    }
    if(username=="")
    {
        throw new ApiError(400,"Username is required");
    }
    if(password=="")
    {
        throw new ApiError(400,"Password is required");
    }

    const existedUser=User.findOne({
        $or: [{ email: email }, { username: username }]
    })
    if(existedUser){
        throw new ApiError(400,"User already exists with this email or username");
    }

    const avatarLocalPath=req.files?.avatar[0]?.path;

    //const coverImageLocalPath=req.files?.coverImage[0]?.path;

    let coverImageLocalPath="";
    if(req.files && Array.isarray(req.files.coverImage) && req.files.coverImage.length > 0){
        coverImageLocalPath=req.files.coverImage[0].path;
    }
    if(!avatar){
        throw new ApiError(400,"Avatar is required");
    }

    const avatar= await uploadOnCloudinary(avatarLocalPath)
    const coverImage= await uploadOnCloudinary(coverImageLocalPath)

    if(!coverImage){
        throw new ApiError(400,"Cover image is required");
    }

    const user= await User.create({
        fullName,
        avatar:avatar.url,
        coverImage:coverImage?.url || "",
        email,
        username:username.toLowerCase(),
        password
    })

    const createdUser=await User.findById(user._id).select(
        "-password -refreshToken"
    )
if(!createdUser){
    throw new ApiError(500,"User registration failed");
}

return res.status(201).json(
    new ApiResponse(200,createdUser,"User registered successfully",createdUser))
})


export {registerUser};