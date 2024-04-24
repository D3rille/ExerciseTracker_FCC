const {model, Schema} = require("mongoose");

const exerciseSchema = new Schema({
    username:{
        type:String,
        required: true
    },
    description:{
        type:String,
        required: true
    },
    duration:{
        type:Number,
        required: true
    },
    date:{
        type:String
    }

});

const Exercise =  model("Exercise", exerciseSchema);

module.exports = Exercise;
