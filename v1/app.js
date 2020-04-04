var express = require("express");
var app = express();
var bodyParser = require("body-parser");
var mongoose = require("mongoose");

mongoose.connect("mongodb://localhost/yelp_camp");
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");

// schema setup
var campgroundSchema = new mongoose.Schema({
	name: String,
	image: String,
	description: String,
});

var Campground = mongoose.model("Campground", campgroundSchema);

// Campground.create({
// 	name: "Mountain Goat", 
// 	image:"https://www.travelyosemite.com/media/610215/housekeeping-camp_camp-view_1000x667.jpg",
// 	description: "This is a mountain with goats. No bathrooms, no water."
// }, function(err, campground) {
// 	if(err){
// 		console.log(err);
// 	} else {
// 		console.log("NEWLY CREATED CAMPGROUND: ");
// 		console.log(campground);
// 	}
// });

app.get("/", function(req, res){
	res.render("landing");
});

app.get("/campgrounds", function(req, res){
	// get all campgrounds from DB
	Campground.find({}, function(err, allCampgrounds) {
		if(err) {
			console.log(err);
		} else {
			res.render("index", {campgrounds:allCampgrounds});
		}	
	});
	// res.render("campgrounds", {campgrounds: campgrounds});
});

app.post("/campgrounds", function(req, res){
	// get data from form and add to campgrounds array
	// res.send("You hit the post route!")
	var name = req.body.name;
	var image = req.body.image;
	var description = req.body.description;
	var newCampground = {name: name, image: image, description: description}
	// create a new campground and save to DB
	Campground.create(newCampground, function(err, newlyCreated){
		if(err){
			console.log(err);
		} else {
			// redirect back to campgrounds page
			res.redirect("/campgrounds");		}
	});
	
});

app.get("/campgrounds/new", function(req, res){
	res.render("new.ejs")
});

app.get("/campgrounds/:id", function(req, res){
	// find the campground with provided ID
	Campground.findById(req.params.id, function(err, foundCampground){
		if(err) {
			console.log(err);
		} else {
			// render show template of that campground
			res.render("show", {campground: foundCampground});
		}
	});
	// res.render("show");
});

// var port = process.env.PORT || 3000;
app.listen(3000, function(){
	console.log("The YelpCamp Server Has Started!");
});

