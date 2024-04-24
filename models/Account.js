const {model, Schema} = require("mongoose");

const accountSchema = new Schema({
    username:{
        type:String,
        required: true
    }
});

const Account =  model("Account", accountSchema);

module.exports = Account;
