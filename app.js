var express        = require("express"),
    app            = express(),
    bodyParser     = require("body-parser"),
	mongoose       = require("mongoose"),
	Campground     = require("./models/campground"),
	Comment        = require("./models/comment"),
	seedDB         = require("./seeds"),
	flash          = require("connect-flash"),
	passport       = require("passport"),
	LocalStrategy  = require("passport-local"),
	User           = require("./models/user"),
	methodOverride = require("method-override"),
	request        = require("request");

//Requiring routes
var commentRoutes     = require("./routes/comments"),
	campgroundRoutes  = require("./routes/campgrounds"),
	indexRoutes       = require("./routes/index")

mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.set('useUnifiedTopology', true);


var db_url = process.env.DATABASEURL || "mongodb://localhost/yelp_camp_v13";
mongoose.connect(db_url);

// seedDB();



app.use(flash());

//Passport config
app.use(require("express-session")({
	secret: "Lola is super cute",
	resave: false,
	saveUninitialized: false
	
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine","ejs");
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));

app.use(function(req,res,next){
	res.locals.currentUser = req.user;
	res.locals.error = req.flash("error");
	res.locals.success = req.flash("success");
	res.locals.gmaps_api_key = process.env.GMAPS_API_KEY || 'noapi';
	next();
});


// Campground.deleteMany({}, function(err){
// 	Comment.deleteMany({},function(err){
// 		User.deleteMany({},function(err){
// 			// seedDB();
// 		});
	
// 	});
// });

app.use("/",indexRoutes);
app.use("/campgrounds/:id/comments",commentRoutes);
app.use("/campgrounds",campgroundRoutes);

var heroku_var = process.env.HEROKU || '0';
if(heroku_var === '0'){
	app.listen(3000,function(){
		console.log("Running on port 3000.")
	});
}
else{
	app.listen(process.env.PORT,process.env.IP);
}
