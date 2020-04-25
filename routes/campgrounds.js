var express = require("express");
var router = express.Router();

var Campground = require("../models/campground");
var middleware = require("../middleware");

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
router.post("/", middleware.isLoggedIn,function(req,res){
	//get data from form and add to campgrounds array
	var name = req.body.name;
	var image = req.body.image;
	var desc = req.body.description;
	var price = req.body.price;
	var author = {
		id: req.user._id,
		username: req.user.username
	}
	newCampground = {name:name,image:image,description:desc,author:author,price:price};
	// Create a new campground and save to DB
	Campground.create(newCampground,function(err,newlyCreated){
		if(err){
			console.log(err)
		}
		else{
			//redirect to campgrounds page
			req.flash("success","Campground added successfully!");
			res.redirect("/campgrounds");
		}
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
router.put("/:id",middleware.checkCampgroundOwnership,function(req,res){
	//find and update campground
	Campground.findByIdAndUpdate(req.params.id,req.body.campground,function(err,updateCampground){
		if(err){
			res.redirect("/campgrounds");
		}
		else{
			req.flash("success","Campground edited successfully!");
			res.redirect("/campgrounds/" + req.params.id);
		}
	});
	//redirect to show page
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




module.exports = router;
