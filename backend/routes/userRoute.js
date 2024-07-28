const express = require("express")
const bcrypt = require("bcryptjs")
const UserModel = require("../model/userModel")
const userRouter = express.Router()
const jwt = require("jsonwebtoken")

var validator = require("email-validator");
const authMiddleware = require("../middlewares/authMiddleware")
const emailHelper = require("../config/emailHelper")

const SALT_ROUNDS = 12


// Collision check
// 90000 - 99999
const otpGenerator = function () {
    return Math.floor((Math.random() * 10000) + 90000);
}


userRouter.post("/register", async (req, res) => {
    try {
        const isEmailValid = validator.validate(req.body.email)

        if (!isEmailValid) {
            return res.status(500).send({
                success: false,
                message: "Please enter a valid email"
            })
        }

        // Find if there is an user with the email
        const isUserPresent = await UserModel.findOne({
            email: req.body.email
        })
        if (isUserPresent) {
            return res.status(500).send({
                success: false,
                message: "Email is already taken!"
            })
        }

        // Create a new User object locally
        const user = new UserModel(req.body)

        //Generating salt and hashing our password

        const salt = await bcrypt.genSalt(SALT_ROUNDS)
        const hashedPassword = await bcrypt.hash(req.body.password, salt)

        user.password = hashedPassword

        // Then save it to Database
        await user.save()

        return res.send({
            success: true,
            message: "registration is successful",
            user
        })
    } catch (e) {
        console.log(e)
        res.status(500).send({
            success: false,
            message: "Internal Server Error"
        })
    }

})


userRouter.post("/login", async function (req, res) {
    try {
        // Create a new User object locally
        const user = await UserModel.findOne({
            email: req.body.email
        })

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "No user found"
            })
        }

        // Checking if password is valid or not
        // if(req.body.password !== user.password) {
        //     return res.status(404).send({
        //         success: false,
        //         message: "No user/pass combo found"
        //     })
        // }

        const isPasswordValid = await bcrypt.compare(req.body.password, user.password)
        if (!isPasswordValid) {
            return res.status(404).send({
                success: false,
                message: "No user/pass combo found"
            })
        }

        // Start my JWT Signing process
        const token = jwt.sign(
            // FIrst argument is the extra data stored in JWT
            {
                userId: user._id
            },
            // Second argument is the secret
            process.env.JWT_SECRET,
            // Sets the expiry of the JWT
            {
                expiresIn: "1d"
            }
        )


        res.send({
            success: true,
            message: "Successfully logged in!",
            token,
            role: user.role
        })
    } catch (e) {
        console.log(e)
        res.status(500).send({
            success: false,
            message: "Internal Server Error"
        })
    }

})


userRouter.get("/get-current-user", authMiddleware, async function (req, res) {
    try {
        // Try to get the req.body.userid from the req object

        const userId = req.body.userId

        if (!userId) {
            return res.status(500).send({
                success: false,
                message: "Something went wrong! Try again"
            })
        }

        const user = await UserModel.findById(userId).select("-password")

        res.send({
            success: true,
            user
        })
    } catch (error) {
        res.status(500).send({
            success: false,
            message: "Something went wrong! Try again"
        })
    }
})

userRouter.post("/forgetpassword", async function (req, res) {
    try {
        /****
                * 1. You can ask for email
                * 2. check if email is present or not
                *  * if email is not present -> send a response to the user(user not found)
                * 3. if email is present -> create basic otp -> and send to the email 
                * 4. also store that otp -> in the userModel
                * 5. to avoid that collison
                *      response -> unique url with id of the user and that will form your reset password 
                * 
                * ***/
        if (req.body.email == undefined) {
            return res.status(401).json({
                status: "failure",
                message: "Please enter the email for forget Password"
            })
        }
        // find the user -> going db -> getting it for the server
        let user = await UserModel.findOne({ email: req.body.email });

        // If user is not present, then we can't reset password
        if (user == null) {
            return res.status(404).json({
                status: "failure",
                message: "user not found for this email"
            })
        }

        // got the user -> on your server
        const otp = otpGenerator();

        // Check if this OTP is present in the OTPTable
        // Maybe use a while loop while here


        // Alternative
        // Before saving OTP< check if OTP is present for any user
        // UserModel.findOne({ otp: otp });


        user.otp = otp;
        user.otpExpiry = Date.now() + 10 * 60 * 1000;
        // those updates will be send to the db
        await user.save();
        res.status(200).json({
            status: "success",
            message: "otp sent to your email",
        });
        // send the mail to there email -> otp
        await emailHelper(
            "otp.html"
            , user.email,
            {
                name: user.name,
                otp: otp
            });
    } catch (err) {
        console.log({ err })
        res.status(500).json({
            message: err.message,
            status: "failure"
        })
    }
    //  email
})


userRouter.post("/resetpassword", async function (req, res) {
    //  -> otp 
    //  newPassword and newConfirmPassword 
    // -> params -> id 
    try {
        let resetDetails = req.body;
        // required fields are there or not 
        if (!resetDetails.password == true || !resetDetails.otp == true) {
            return res.status(401).json({
                status: "failure",
                message: "invalid request"
            })
        }
        // it will serach with the id -> user
        const user = await UserModel.findOne({ otp: req.body.otp });
        // if user is not present
        if (user == null) {
            return res.status(404).json({
                status: "failure",
                message: "OTP is wrong"
            })
        }
        // if otp is expired
        if (Date.now() > user.otpExpiry) {
            return res.status(401).json({
                status: "failure",
                message: "otp expired"
            })
        }

        // If we are till here, that means
        // If we identified the user with the OTP
        // OTP is within validaity period
        // Now we need to update the user with the password

        const salt = await bcrypt.genSalt(SALT_ROUNDS)
        const hashedPassword = await bcrypt.hash(req.body.password, salt)

        user.password = hashedPassword
        // remove the otp from the user
        user.otp = undefined;
        user.otpExpiry = undefined;
        await user.save();
        res.status(200).json({
            status: "success",
            message: "password reset successfully"
        })
        console.log("Reset")
    } catch (err) {
        res.status(500).json({
            message: err.message,
            status: "failure"
        })
    }


})



module.exports = userRouter; 