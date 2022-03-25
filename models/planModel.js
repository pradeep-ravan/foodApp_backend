const mongoose = require("mongoose");
const emailValidator = require("email-validator");
let {DB_LINK} = require("../../../secrets");
mongoose.connect(DB_LINK,{
}).then(function () {
    //console.log(db);
   // console.log("connected to db");
}).catch(function (err) {
    console.log("err",err);
})




//syntax
const planSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true,"kindly pass the name"],
        unique: true,
        maxlength: [40, "Your plan length is more than 40 characters"],
    },
    duration: { 
        type: Number,
        required: [true, "you need to provide duration"] 
    },
    price: {
        type: Number,
        required: true
    },
    ratingsAverage: {
        type: Number
    },
    discount: {
        type: Number,
        validate: {
            validator: function () {
                return this.discount < this.price;
            },
            message: "Discount must be less than actual price",
        },
    },
    reviews: {
        type:[mongoose.Schema.ObjectId],   //array of object id
        ref:"reviewModel"
    },
    averageRating: Number
})
 
const planModel = mongoose.model("planModel", planSchema);


 module.exports = planModel;