var express = require("express");
var app = express();
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var Campground = require("./models/campground");
var Comment = require("./models/comment");
var User = require("./models/user");
var seedDB = require("./seeds");
var passport = require("passport");
var bodyParser = require("body-parser");
var LocalStrategy = require("passport-local");
var passportLocalMongoose = require("passport-local-mongoose");

seedDB();
mongoose.connect("mongodb://localhost/yelp_camp");
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"))


// PASSPORT CONFIGURATION
app.use(require("express-session")({
	secret: "Once again Rusty wins cutest dog!",
	resave: false,
	saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req, res, next){
	res.locals.currentUser = req.user;
	next();
});

app.get("/", function(req, res){
	res.render("landing");
});

app.get("/campgrounds", function(req, res){
	
	// get all campgrounds from DB
	Campground.find({}, function(err, allCampgrounds) {
		if(err) {
			console.log(err);
		} else {
			res.render("campgrounds/index", {campgrounds:allCampgrounds, currentUser: req.user});
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
	res.render("camgrounds/new.ejs")
});

app.get("/campgrounds/:id", function(req, res){
	// find the campground with provided ID
	Campground.findById(req.params.id).populate("comments").exec(function(err, foundCampground){
		if(err) {
			console.log(err);
		} else {
			console.log(foundCampground);
			// render show template of that campground
			res.render("campgrounds/show", {campground: foundCampground});
		}
	});
	// res.render("show");
});

// ==============
// COMMENTS ROUTES
// ==============

app.get("/campgrounds/:id/comments/new", isLoggedIn, function(req, res){
	Campground.findById(req.params.id, function(err, campground){
		if(err) {
			console.log(err);
		} else {
			res.render("comments/new", {campground: campground});
		}
	})
});

app.post("/campgrounds/:id/comments", isLoggedIn, function(req, res){
	// lookup campground using ID
	Campground.findById(req.params.id, function(err, campground){
		if(err) {
			console.log(err);
			res.redirect("/campgrounds");
		} else {
			Comment.create(req.body.comment, function(err, comment){
				if(err) {
					console.log(err);
				} else {
					campground.comments.push(comment);
					campground.save();
					res.redirect("/campgrounds/" + campground._id);
				}
			})
		}
	});
});

// ===============
// AUTH ROUTES
// ===============

// show register form
app.get("/register", function(req, res) {
	res.render("register");
});

// handle sign up logic
app.post("/register", function(req, res) {
	var newUser = new User({username: req.body.username});
	User.register(newUser, req.body.password, function(err, user){
		if(err) {
			console.log(err);
			return res.render("register");
		}
		passport.authenticate("local")(req, res, function(){
			res.redirect("/campgrounds");
		});
	});
});

// show login form
app.get("/login", function(req, res){
	res.render("login");
})

// handling login logic
// app.post("/login", middleware, callback)
app.post("/login", passport.authenticate("local", 
	{
		successRedirect: "/campgrounds",
	 	failureRedirect: "/login"
	 }), function(req, res){

});

// logout route
app.get("/logout", function(req, res){
	req.logout();
	res.redirect("/campgrounds");
});

function isLoggedIn(req, res, next) {
	if(req.isAuthenticated()){
		return next();
	}
	res.redirect("/login");
}

// var port = process.env.PORT || 3000;
app.listen(3000, function(){
	console.log("The YelpCamp Server Has Started!");
});

