var express = require("express");
var router = express.Router();
var request = require("request");

var Campground = require("../models/campground");
var middleware = require("../middleware");

var multer = require('multer');
var storage = multer.diskStorage({
  filename: function(req, file, callback) {
    callback(null, Date.now() + file.originalname);
  }
});
var imageFilter = function (req, file, cb) {
    // accept image files only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
};
var upload = multer({ storage: storage, fileFilter: imageFilter})

var cloudinary = require('cloudinary');
cloudinary.config({ 
  cloud_name: 'dcfrjhaiq', 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET
});


//Index - show all campgrounds
router.get("/",function(req,res){
	
	//Get all campground from DB
	Campground.find({},function(err,allCampgrounds){
		if(err){
			consolge.log(err);
		}
		else{
			res.render("campgrounds/index",{campgrounds:allCampgrounds});
		}
	});
		
});

//CREATE
router.post("/", middleware.isLoggedIn, upload.single('image'), function(req, res) {
	//get data from form and add to campgrounds array
	var name = req.body.name;
	// var image = req.body.image;
	var desc = req.body.description;
	var price = req.body.price;
	var address = req.body.address;
	var url = "https://maps.googleapis.com/maps/api/geocode/json?address=" + address + "&key=" + res.locals.gmaps_api_key;
	request(url,function(error,response,body){
		var coordinates = {lat:0,lng:0};
		if(!error && response.statusCode == 200){
			var data = JSON.parse(body);
			if(data.results.length > 0){
				// console.log(data.results[0].geometry.location);
				coordinates = data.results[0].geometry.location;
			}
			
			else{			
				req.flash("error","Campground address not found");
			}
		}
		
		
		var author = {
			id: req.user._id,
			username: req.user.username
		}
		
		cloudinary.uploader.upload(req.file.path, function(result) {
			var image = result.secure_url;
			var newCampground = {name:name,image:image,description:desc,author:author,price:price,address:address,coordinates:coordinates};
			// Create a new campground and save to DB
			Campground.create(newCampground,function(err,newlyCreated){
				if(err){
					req.flash('error', err.message);
      				return res.redirect('back');
				}
				else{
					//redirect to campgrounds page
					req.flash("success","Campground added successfully!");
					res.redirect("/campgrounds");
				}
			});
		});
	});
	
});

//NEW

router.get("/new",middleware.isLoggedIn,function(req,res){
	res.render("campgrounds/new");
});

//SHOW
router.get("/:id",function(req,res){
	//Find campground with provided ID
	Campground.findById(req.params.id).populate("comments").exec(function(err,foundCampground){
		if(err){
			console.log(err);
		}
		else{
			//console.log(foundCampground);
			res.render("campgrounds/show",{campground:foundCampground});
		}
	});
	
});

//EDIT CAMPGROUND ROUTE

router.get("/:id/edit",middleware.checkCampgroundOwnership,function(req,res){
		
	Campground.findById(req.params.id,function(err,foundCampground){		
		res.render("campgrounds/edit",{campground:foundCampground});		
	});	
});

//UPDATE CAMPGROUND ROUTE
// router.put("/:id",middleware.checkCampgroundOwnership,function(req,res){
// 	//find and update campground
// 	Campground.findByIdAndUpdate(req.params.id,req.body.campground,function(err,updateCampground){
// 		if(err){
// 			res.redirect("/campgrounds");
// 		}
// 		else{
// 			req.flash("success","Campground edited successfully!");
// 			res.redirect("/campgrounds/" + req.params.id);
// 		}
// 	});
// 	//redirect to show page
// });


router.put("/:id", middleware.isLoggedIn,function(req,res){
	//get data from form and add to campgrounds array
	var name = req.body.campground.name;
	var image = req.body.campground.image;
	var desc = req.body.campground.description;
	var price = req.body.campground.price;
	var address = req.body.campground.address;
	var url = "https://maps.googleapis.com/maps/api/geocode/json?address=" + address + "&key=" + res.locals.gmaps_api_key;
	request(url,function(error,response,body){
		var coordinates = {lat:0,lng:0};
		if(!error && response.statusCode == 200){
			var data = JSON.parse(body);
			if(data.results.length > 0){
				// console.log(data.results[0].geometry.location);
				coordinates = data.results[0].geometry.location;
			}
			
			else{			
				req.flash("error","Campground address not found");
			}
		}
		
		
		// var author = {
		// 	id: req.user._id,
		// 	username: req.user.username
		// }
		var newCampground = {name:name,image:image,description:desc,price:price,address:address,coordinates:coordinates};
		// console.log(newCampground)
		
		Campground.findByIdAndUpdate(req.params.id,newCampground,function(err,updateCampground){
			if(err){
				res.redirect("/campgrounds");
			}
			else{
				req.flash("success","Campground edited successfully!");
				res.redirect("/campgrounds/" + req.params.id);
			}
		});
		
	});
	
});

//DESTROY CAMPGROUND ROUTE
router.delete("/:id",middleware.checkCampgroundOwnership,function(req,res){
	Campground.findByIdAndRemove(req.params.id,function(err){
		if(err){
			res.redirect("/campgrounds");
		}
		else{
			req.flash("success","Campground deleted successfully!");
			res.redirect("/campgrounds");
		}
	})
});

// function getCoordinates(address){
// 	var url = "https://maps.googleapis.com/maps/api/geocode/json?address=" + address + "&key=" + res.locals.gmaps_api_key;
// 	var res = {lat:0,lng:0};
// 	request(url,function(error,response,body){
		
// 		if(!error && response.statusCode == 200){
// 			var data = JSON.parse(body);
// 			// console.log(data.results[0].geometry.location);
// 			res = data.results[0].geometry.location;
			
// 		}		
		
// 	});
// 	return res;	
// }

module.exports = router;
