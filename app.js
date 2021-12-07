const express = require("express");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const passport = require('passport');
require("dotenv").config();
// configure global environment
const hostname = process.env.HOST || '127.0.0.1';
const port = process.env.PORT || 3000;

// instantiate the app
const app = express();

// configure the app
app.set("view engine", "ejs");
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(session({
  secret: process.env.SECRET,
  resave: true,
  saveUninitialized: true
}));

// routes and models
const User = require('./controllers/index.js');
const fetch = require('node-fetch');

require('./config/passport')
app.use(require('./routes'));

// middleware & session management
app.use(passport.initialize());
app.use(passport.session());
const auth = require('./routes/auth');
const login = require('./routes/isLoggedIn');

// database sync
var models = require("./models");
models.sequelize.sync().then(function () {
  console.log('Database sync complete!');
})
  .catch(function (err) {
    console.log(err, 'Something went wrong with the database sync.');
  });

const db = require("./public/js/database.js");
const { sequelize } = require("./models");

const time = require("./public/js/time.js");
const unsplash = require("./public/js/unsplash.js");
const user = require("./controllers/user.js");

// node localstorage
var LocalStorage = require('node-localstorage').LocalStorage,
  localStorage = new LocalStorage('./scratch');

// stream API
const stream = require('getstream');
const { like } = require("sequelize/dist/lib/operators");

// instantiate a new client (server side) 
const client = stream.connect(
  process.env.STREAM_API_KEY,
  process.env.STREAM_API_SECRET
);

// routes

/* UNAUTHENTICATED ROUTES */

app.all('/', (req, res) => {
  res.render("index");
}); // default

app.all('/pricing', (req, res) => {
  res.render("pricing");
}); // pricing

app.all('/about', (req, res) => {
  res.render("about");
}); // about

app.all('/contact', (req, res) => {
  res.render("contact");
}); // contact

/* -------------------- */
/* AUTHENTICATION ROUTES */

app.get('/login', (req, res) => {
  res.render("login", { status_message: "" });
});

app.get('/logout', (req, res) => {
  res.clearCookie("XSRF-TOKEN");
  res.render('index');
});

app.get('/register', (req, res) => {
  res.render("register");
});

app.get('/registerSuccess', (req, res) => {
  res.render("registerSuccess");
});

app.get('/forgotPassword', (req, res) => {
  res.render("forgotPassword", { "status_message": req.message });
});

app.get('/resetPassword', auth, (req, res, next) => {
  return res.render("resetPassword", { user_email: req.query.email, status_message: "" });
});

/* -------------------- */
/* APPLICATION ROUTES */

app.get("/home", [auth, login.isLoggedIn], async (req, res) => {
  const { id, email, firstname, lastname } = req.user;
  // check if cookie has expired, if yes reset the image stored in local storage

  if (req.cookies.foo === undefined) {
    res.cookie('foo', 'bar', { expires: time.getExpirationDate() });
    let url = await unsplash.url();
    let quote = await fetch(`https://zenquotes.io/api/today/${process.env.ZEN_QUOTES_API_KEY}`);
    let quote_json = await quote.json();
    localStorage.setItem('imageURL', url);
    localStorage.setItem('dailyQuote', JSON.stringify(quote_json));
  }

  let userId = id.toString();
  let curUser = client.feed('user', userId);

  // Read timeline
  let results = await curUser.get({ limit: 10, reactions: { recent: true, counts: true, own: true } });
  let followStats = await curUser.followStats();

  res.render("home", {
    user: req.user,
    activities: await db.getActivites(id),
    currentChallenge: await db.getCurrentChallenge(id),
    previousChallenge: await db.getPreviousChallenges(id),
    backgroundURL: localStorage.getItem('imageURL'),
    dailyQuote: JSON.parse(localStorage.getItem('dailyQuote')),
    feed: results.results,
    followStats: followStats.results,
  });
});

app.get("/profile", [auth, login.isLoggedIn], async (req, res) => {
  const { id, email, firstname, lastname } = req.user;
  // check if cookie has expired, if yes reset the image stored in local storage

  res.render("profile", {
    user: req.user,
    previousChallenge: await db.getPreviousChallenges(id)
  });
});

app.get("/createChallenge", [auth, login.isLoggedIn], (req, res) => {
  res.render("createChallenge", {
    user: req.user
  });
});

app.post("/createChallenge", [auth, login.isLoggedIn], async (req, res) => {
  const { id, email, firstname, lastname } = req.user;
  let { length, name, weeklySpend, numDrinks } = req.body;
  let startDate = new Date();
  let endDate = new Date(new Date().getTime() + (length * 24 * 60 * 60 * 1000));
  try {
    db.createChallenge(req.user.id, name, startDate, length, endDate, weeklySpend, numDrinks);
    res.redirect("/home");
  } catch (err) {
    console.log(err);
  }

  const userFeed = client.feed('user', id.toString());

  await userFeed.addActivity({
    actor: firstname + ' ' + lastname,
    verb: 'challenge',
    object: 1,
    message: name
  });
});

app.post("/endChallenge", [auth, login.isLoggedIn], (req, res) => {
  let id = req.body.id;
  try {
    db.endChallenge(id);
    res.redirect("/home");
  } catch (err) {
    console.log(err);
  }
});

app.get('/report', [auth, login.isLoggedIn], async (req, res) => {
  const { id, email, firstname, lastname } = req.user;
  res.render("report", {
    user: req.user,
    currentChallenge: await db.getCurrentChallenge(id),
    previousChallenge: await db.getPreviousChallenges(id),
    metrics: await db.getReportMetrics(id)
  });
}); //report

app.get('/report1', auth, async (req, res) => {
  const userid = req.query.id;
  res.send(await db.getReportJournalEntries(userid));
});

app.get('/report2', auth, async (req, res) => {
  const userid = req.query.id;
  res.send(await db.getEmotionCountByDate(userid));
});

app.get('/journal', [auth, login.isLoggedIn], async (req, res) => {
  const { id, email, firstname, lastname } = req.user;
  res.render('journal', {
    user: req.user,
    allJournalEntries: await db.getJournalEntries(id),
    currentChallenge: await db.getCurrentChallenge(id),
  });
}); //journal

app.post("/createJournalEntry", [auth, login.isLoggedIn], async (req, res) => {
  const { id, email, firstname, lastname } = req.user;
  const { challengeid, name, description, userid } = req.body;
  let content = (req.body.content === undefined) ? 0 : 1;
  let happy = (req.body.happy === undefined) ? 0 : 1;
  let sad = (req.body.sad === undefined) ? 0 : 1;
  let craving = (req.body.craving === undefined) ? 0 : 1;
  let overwhelemd = (req.body.overwhelemd === undefined) ? 0 : 1;
  let tired = (req.body.tired === undefined) ? 0 : 1;
  let type = "journal entry";
  try {
    db.createChallengeActivity(challengeid, type, description, name, content, happy, sad, craving, overwhelemd, tired);

  } catch (err) {
    console.log(err);
  }

  const userFeed = client.feed('user', id.toString());

  await userFeed.addActivity({
    actor: firstname + ' ' + lastname,
    verb: 'journal',
    object: 1,
    message: description
  });

  res.redirect("/journal");
});

app.get('/messages', [auth, login.isLoggedIn], (req, res) => {
  res.render('messages', {
    user: req.user
  });
});

app.get('/browseUsers', [auth, login.isLoggedIn], async (req, res) => {
  const { id, email, firstname, lastname } = req.user;
  res.render("browseUsers",
    {
      user: req.user,
      allUsers: await db.getAllUsers(id)
    });
});

// start server
app.listen(port, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});