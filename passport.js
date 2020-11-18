var express = require('express'),
	bodyParser = require('bodyparser'),
	passport = require('passport'),
	LocalStrategy = require('passport-local'),
	User = require('./db'),
	router = express.Router;

passport.use(new LocalStrategy((username, password, done) => {
	User.findOne({ username: username }, async (err, user) => {
		if (err) { return done(err); }
		if (!user) {
			return done(null, false, { message: 'Incorrect username.' });
		}

		if (!await user.validPassword(password)) {
			return done(null, false, { message: 'Incorrect password.' });
		}
		return done(null, user);
	});
}));

passport.serializeUser((user, done) => {
	done(null, user._id);
});

passport.deserializeUser((id, done) => {
	User.findOne({ _id: id }, (err, doc) => {
		if (err) done(err, null);
		done(null, doc);
	});
});

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));

router.use(function useHttps(req, res, next) {
	if (req.secure) {
		// request was via https, so do no special handling
		next();
	} else {
		// request was via http, so redirect to https
		res.redirect('https://' + req.headers.host + req.url);
	}
});

router.use(passport.initialize());
router.use(passport.session());

router.post('/fb/recentactivity/login', passport.authenticate('local', {
	failureRedirect: '/login',
	successRedirect: '/profile'
}));

module.exports = router;