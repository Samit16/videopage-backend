import { Router } from "express";
import { 
    loginUser,
    logoutUser,
    registerUser,
    refreshAccessToken, 
    changeCurrentPassword, 
    getCurrentUser,
    updateUserCoverImage,
    updateUserAvatar,
    getUserChannelCoverImage,
    getWatchHistory
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { getCurrentStack } from "three/tsl";

const router=Router();

router.route("/register").post
(upload.fields([
    {
        name:"avatar",
        maxCount:1
    },
    {
        name:"coverImage",
        maxCount:1
    }
]),
    registerUser);

router.route("/login").post(loginUser);


//secured routes
router.route("/logout").post(verifyJWT,logoutUser);
router.route("/refresh-token").post(refreshAccessToken);
router.route("/change-password").post(verifyJWT,changeCurrentPassword);
router.route("/current-user").get(verifyJWT, getCurrentUser);
router.route("/update-account").patch(verifyJWT,updateAccountSettings);
router.route("/avatar").patch(verifyJWT,upload.single("avatar"),updateUserAvatar);
router.route("/coverImage").patch(verifyJWT,upload.single("coverImage"),updateUserCoverImage);
router.route("/c/:username").get(getUserProfile);
router.route("/watch-history").get(verifyJWT,getWatchHistory);


export default router;