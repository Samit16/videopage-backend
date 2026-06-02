import {asyncHandler} from '../utils/asyncHandler.js';
import {ApiError} from '../utils/ApiError.js';
import {User} from '../models/user.model.js';
import {uploadToCloudinary} from '../utils/cloudinary.js';
import {ApiResponse} from '../utils/ApiResponse.js';
import jwt from 'jsonwebtoken';

const generateAccessToken=async(userId)=>{
    try{
    const user=await User.findById(userId)

    const accessToken=user.generateAccessToken()
    const refreshToken=user.generateRefreshToken()

    user.refreshToken=refreshToken
    await user.save({validateBeforeSave:false})

    return {accessToken,refreshToken}
    
    }catch(error){
        throw new ApiError(500,"Failed to generate access token");
    }
}

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

const loginUser=asyncHandler(async(req,res)=>{
    //req body->data
    //username or email
    //find user in db
    //if user found compare password
    //if password is incorrect throw error
    //if password is correct generate access token and refresh token
    //save refresh token in database
    //return response to frontend with access token and user details

    const {email,username,password}=req.body

    if(!username || !email){
        throw new ApiError(400,"Username or email is required");
    }
    const  user=await User.findOne({
        $or:[
            {username},{email}]
    })
    if(!user){
        throw new ApiError(404,"User not found with this email or username");
    }
    const isPasswordValid=await user.isPasswordCorrect(password)

    if(!isPasswordValid){
        throw new ApiError(400,"Invalid password");
    }

    const {accessToken, refreshToken} = await generateAccessToken(user._id)

const loggedInUser=await User.findById(user._id).select("-password -refreshToken")

const options={
    httpOnly:true,
    secure:true,
}
return res.status(200)
.cookie("refreshToken",refreshToken,options)
.cookie("accessToken",accessToken,options)
.json(new ApiResponse(200,{
        user:loggedInUser,accessToken,refreshToken
    },
    "User logged in successfully",loggedInUser
)
)
})

const logoutUser=asyncHandler(async(req,res)=>{
    await User.findByIdAndUpdate(req.user._id,
        {
            $set:{refreshToken:undefined}
        },
        {new:true}
)
const options={
    httpOnly:true,
    secure:true,
}
return res
.status(200)
.clearCookie("accessToken",options)
.clearCookie("refreshToken",options)
.json(new ApiResponse(200,{},"User logged out successfully",null))
})

const refreshAccessToken=asyncHandler(async(req,res)=>{
    const incomingRefreshToken=req.cookies.refreshToken || req.body.refreshToken
    
    if(!incomingRefreshToken){
        throw new ApiError(400,"Refresh token is required");
    }
    try{
    const decodedToken=jwt.verify(
        incomingRefreshToken,
        process.env.REFRESH_TOKEN_SECRET,
    )

    const user=await User.findById(decodedToken?._id)

    if(!user){
        throw new ApiError(401,"Unauthorized: User not found");
    }
    if(incomingRefreshToken !== user?.refreshToken){
        throw new ApiError(401,"Unauthorized: Invalid refresh token");
    }

    const options={
        httpOnly:true,
        secure:true,
    }
    const {accessToken,newRefreshToken}= await generateAccessAndRefreshToken(user._id)

    return res
    .status(200)
    .cookie("refreshToken",newRefreshToken,options)
    .cookie("accessToken",accessToken,options)
    .json(new ApiResponse(200,{accessToken,newRefreshToken},"Access token refreshed successfully",null))
}
catch(error){
    throw new ApiError(401,"Unauthorized: Invalid refresh token");
}
})
export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken
};