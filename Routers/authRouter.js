const userModel = require("../models/userModel");
const express= require("express");
const jwt = require("jsonwebtoken");
const {JWT_KEY} = process.env;
const authRouter = express.Router();
let emailSender=require("./../helpers/emailSender");
authRouter
    .post("/signup",setCreatedAt,signupUser)
    .post("/login",loginUser)
    .post("/forgetPassword", forgetPassword)
    .post("/resetPassword", resetPassword)

function setCreatedAt(req, res, next) {
        //{}
        let body = req.body;
        let length = Object.keys(body).length;
        if(length==0){
            return res.status(400).json({
                message: "can't create user when body is empty"
            })
        }
        req.body.createdAt = new Date().toISOString();
        next();
    }
    // let user = [];
    
    
        
    // function createUser(req, res) {
    //     console.log("req.data", req.body);
    //     user = req.body;
    //     res.status(200).send("data received and user added");
    // }
    //find
async function signupUser(req, res) {
        //email,user name,password
        try {
            let userObj = req.body;
            console.log("userObj",req.body);
            let user = await userModel.create(userObj);
            console.log("user", user);
            
            // put in database
            // user.push({
            //     email, name, password
            // })
            res.status(200).json({
            message: "user created",
            createdUser : user
            })
        } catch (err) {
            res.status(500).json({
                message:err.message
            })
        }
    } 
async function loginUser(req, res) {
        //email, password -> userModel ->
        try{
            if(req.body.email){
                let user =await  userModel.findOne({email:req.body.email})
                if(user){
                    if(user.password==req.body.password){
                        //header
                        let payload = user["_id"];
                        let token = jwt.sign({ id: payload }, JWT_KEY );
                        res.cookie("jwt",token,{ httpOnly: true })
                        return res.status(200).json({
                             user,
                             "message": "user logged in"
                         })
                     }else{
                         return res.status(401).json({
                             "message": "Email or password is wrong"
                         })
                     }
                } else {
                    return res.status(401).json({
                        "message": "Email or password is wrong"
                    })
                }
            }else{
                 return res.status(403).json({
                    message: " Email is not present"
                })
            }
        }catch(err) {
            res.status(500).json({
                error:err.message,
                "message": "can't get users"
            })
        }
        //email??
        //email -> user get -> password
    }
async function forgetPassword(req, res) {
    let email = req.body.email;
    let seq = (Math.floor(Math.random() * 10000) + 10000).toString().substring(1);
    console.log(seq);
    try{
        if(email){
            await userModel.updateOne({ email }, { token:seq }); 
        // email send to 
        // nodemailer -> through table tag
        //service -. gmail
        let user = await userModel.findOne({ email });
        await emailSender(seq, user.email);
        console.log(user);
        if(user?.token){
                return res.status(200).json({
                    message:"Email send with token" + seq
                })
        }
        else {
            return res.status(400).json({
                message: "user not found"
            })
        }
        }else{
            return res.status(404).json({
                message: "kindly enter email"
            })
        }     
    }catch (err) {
        console.log(err);
        res.status(500).json({
            message: err.message
        })
    }
   
}
async function resetPassword(req, res) {
    let { token, password, confirmPassword } = req.body;
    try{
        if(token){
            //findOne
            let user = await userModel.findOne({ token });
            if (user){
               // user.resetHandler(password, confirmPassword);
                user.password = password;
                user.confirmPassword = confirmPassword;
                //token reuse not possible
                user.token = undefined;
                console.log(user);
                await user.save();
                res.status(200).json({
                    message: "user password changed"
                })
            }else{
                return res.status(404).json({
                    message: "incorrect token"
                })
            }
        }else{
            return res.status(404).json({
                message: "user not found"
            })
        }
    }catch(err){
        console.log(err);
        res.status(500).json({
            message: err.message
        })
    }
    
}
    let flag = true;

module.exports = authRouter;