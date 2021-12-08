const passport = require('passport');
const express = require('express');
const app = express();
const auth = require('../auth');
const login = require('../isLoggedIn');

app.use(passport.initialize());
app.use(passport.session());

// stream API
const stream = require('getstream');
const e = require('connect-flash');

// instantiate a new client (server side) 
const client = stream.connect(
  process.env.STREAM_API_KEY,
  process.env.STREAM_API_SECRET
);

// Add new Activity
app.post('/add', [auth, login.isLoggedIn], async (req, res, next) => {
  const { id, email, firstname, lastname } = req.user;
  const userFeed = client.feed('user', id.toString());

  // Add an Activity; message is a custom field - tip: you can add unlimited custom fields! 
  await userFeed.addActivity({
    actor: firstname + ' ' + lastname,
    verb: 'add',
    object: 1,
    message: req.body.post
  });

  res.redirect("/home");
});

app.get('/subscribe', [auth, login.isLoggedIn], async (req, res, next) => {
  const { id, email, firstname, lastname } = req.user;
  const userFeed = client.feed('user', id.toString());
  userFeed.follow('user', req.query.id);
  res.redirect("/browseUsers");
});

app.get('/unsubscribe', [auth, login.isLoggedIn], async (req, res, next) => {
  const { id, email, firstname, lastname } = req.user;
  const userFeed = client.feed('user', id.toString());
  userFeed.unfollow('user', req.query.id);
  res.redirect("/browseUsers");
});

app.get('/reaction', [auth, login.isLoggedIn], async (req, res, next) => {
  const { id, email, firstname, lastname } = req.user;
  let type = req.query.type;
  let activityId = req.query.activityId;
  let userId = id.toString();

  if (type === "like") {
    await client.reactions.add("like", activityId, null, { userId });
  } else {
    await client.reactions.delete(activityId);
  }
  res.redirect("/home");
});

module.exports = app;