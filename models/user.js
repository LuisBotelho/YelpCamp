var mongoose = require("mongoose");
mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.set('useUnifiedTopology', true);
//mongoose.connect("mongodb://localhost/yelp_camp");

var passportLocalMongoose = require("passport-local-mongoose");

var UserSchema = new mongoose.Schema({
	username: String,
	password : String
})

UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User",UserSchema);