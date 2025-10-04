require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('cookie-session');

const shopRoutes = require('./routes/shop');
const cartRoutes = require('./routes/cart');
const checkoutRoutes = require('./routes/checkout');
const settingsRoutes = require('./routes/settings');

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.set('view engine', 'ejs');
app.set('views', 'views');

app.use(session({
  name: 'session',
  keys: [process.env.SESSION_SECRET || 'secret'],
  maxAge: 24*60*60*1000
}));

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(()=>console.log("MongoDB connected"))
  .catch(err=>console.log(err));

// Routes
app.use(shopRoutes);
app.use(cartRoutes);
app.use(checkoutRoutes);
app.use(settingsRoutes);

// 404
app.use((req,res)=>res.status(404).send("Page not found"));

app.listen(3000, ()=>console.log("Server running on http://localhost:3000"));

