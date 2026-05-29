import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";



export const verifyJWT=asyncHandler(async (req, _, next) => {
    // Implementation for JWT verification
    try {
    const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","")

    if(!token){
        throw new ApiError(401,"Unauthorized: No token provided");
    }

    const decodedToken=jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)

    const user=await User.findById(decodedToken._id).select("-password -refreshToken")

    if(!user){
        //Todo

        throw new ApiError(401,"Unauthorized: User not found");
}
    req.user=user
    next()   // added for moving to next middleware or route passed after this middleware for secured routes
    // (like logout route in this case and verifyJWT will be used in future for other secured routes like profile update, password change, video upload etc.)
} catch (error) {
    throw new ApiError(401,"Unauthorized: Invalid token");
}
})