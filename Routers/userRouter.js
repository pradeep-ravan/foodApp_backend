const userModel = require("../models/userModel");
const express= require("express");
const userRouter = express.Router();
const protectRoute = require("../Routers/authHelper");
const factory = require("../helpers/factory");
const createUser = factory.createElement(userModel);
const getUsers = factory.getElements(userModel);
const updateUser = factory.updateElement(userModel);
const deleteUser = factory.deleteElement(userModel);
const getUserById = factory.getElementById(userModel);
userRouter
    .route("/:id")
    .get(protectRoute, authorizeUser(["admin", "manager"]), getUserById)
    .patch(updateUser)
    .delete(protectRoute, authorizeUser(["admin"]) ,deleteUser)
userRouter
    .route("/")
    .get(protectRoute,authorizeUser(["admin"]), getUsers)
    .post(protectRoute,authorizeUser(["admin"]), createUser);
    //findByIdAndUpdate
    
    

// async function createUser(req, res) {
//         try{
//             let user = req.body;
//             if (user) {
//                     user = await userModel.create(user);
//                     res.status(200).json({
//                     user: user
//                 });
//             } else {
//                 res.status(200).json({
//                     message: "kindly enter data"
//                 });
//             }
//         }catch (err){
//             console.log(err);
//             res.status(500).json({
//                 message: "Server error"
//             })
//         }
//     }
// async function getUsers(req, res){
//         try{
//             let users = await userModel.find();
//             res.status(200).json({
//                 "message": "list of all the users",
//                 users: users
//             })
//         }catch(err) {
//             res.status(500).json({
//                 error:err.message,
//                 "message": "can't get users"
//             })
//         }
       
//     }

// function updateUser(req, res) {
//         let obj = req.body;
//         for(let key in obj){
//             user[key] = obj[key];
//         }
//         res.status(200).json(user);
//     }
//     //findByIdAndDelete
// function deleteUser(req, res) {
//         user = {};
//         res.status(200).json(user);
//     }
//     //id
// function getUserById(req, res) {
    
//         console.log(req.params.id);
//         res.status(200).send("hello");
//     }    
function authorizeUser(rolesArr) {
    return async function (req, res, next) {
        let uid = req.uid;
        let { role } = await userModel.findById(uid);
        let isAuthorized = rolesArr.includes(role);
        if (isAuthorized) {
            next();
        }else{
            res.status(403).json({
                message: "user not authorized contact admin"
            })
        }
    }
}
module.exports = userRouter;

