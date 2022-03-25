const express = require("express");
const bookingRouter = express.Router();
// const ReviewModel = require("../models/reviewModel");
const protectRoute  = require("../Routers/authHelper");
const bookingModel = require("../models/bookingModel");
const userModel = require("../models/userModel");
const factory = require("../helpers/factory");
const Razorpay = require("razorpay");
let { KEY_ID, KEY_SECRET } = require("../secrets");
var razorpay = new Razorpay({
    key_id: KEY_ID,
    key_secret: KEY_SECRET
});
const initiateBooking = async function (req, res){
    try{
            let booking = await bookingModel.create(req.body);
            let bookingId = booking["_id"];
            let userId = req.body.user;
            let user = await userModel.findById(userId);
            user.bookings.push(bookingId);
            await user.save();
            const payment_capture = 1;
            const amount = 500;
            const currency = "INR";

            const options = {
                amount,
                currency,
                receipt: `rs_${bookingId}`,
                payment_capture,
            };

            const response = await razorpay.orders.create(options);
            console.log(response);
            res.status(200).json({
                id: response.id,
                currency: response.currency,
                amount: response.amount,
                booking:booking,
                message:"booking created"
            });
    }catch(err){
        res.status(500).json({
            message: err.message
        })
    }
};
const getbookings = factory.getElements(bookingModel);
const updatebooking = factory.updateElement(bookingModel);
async function verifyPayment (req, res) {
    const secret = KEY_SECRET;
    // console.log(req.body);
    const shasum = crypto.createHmac("sha256", secret);
    shasum.update(JSON.stringify(req.body));
    const digest = shasum.digest("hex");

    console.log(digest, req.headers["x-razorpay-signature"]);

    if(digest === req.headers["x-razorpay-signature"]) {
        console.log("request is legit");
        res.status(200).json({
            message: "OK"
        });
    }else {
        res.status(403).json({ message: "INVALID" });
    }
};
const deletebooking = async function (req, res){
    try{
        let booking = await bookingModel.findByIdAndDelete(req.body.id);
        console.log("booking",booking);
        let userId = booking.user;
        let user = await userModel.findById(userId);
        let indexOfbooking = user.bookings.indexOf(booking["_id"]);
        user.booking.splice(indexOfbooking, 1);
        await user.save();
        res.status(200).json({
            message:"booking deleted",
            booking:booking
        })
    }catch(err){
        res.status(500).json({
            message: err.message
        })
    }
};
const getbookingById = factory.getElementById(bookingModel);
bookingRouter.use(protectRoute);
bookingRouter.route("/verification").post(verifyPayment)
bookingRouter
    .route("/:id")
    .get(getbookingById)
    .patch(protectRoute, updatebooking)
    .delete(protectRoute, deletebooking)
bookingRouter
    .route("/")
    .get(getbookings)
    .post(protectRoute, initiateBooking)

module.exports=bookingRouter;
