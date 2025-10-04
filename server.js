require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const shopRoutes = require('./routes/shop');
const cartRoutes = require('./routes/cart');
const checkoutRoutes = require('./routes/checkout');
const settingsRoutes = require('./routes/settings');

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.set('view engine', 'ejs');
app.set('views', 'views');

// Connect MongoDB
mongoose.connect(process.env.MONGO_URI)
.then(()=>console.log("MongoDB connected"))
.catch(err=>console.log(err));

// Routes
app.use(shopRoutes);
app.use(cartRoutes);
app.use(checkoutRoutes);
app.use(settingsRoutes);

app.listen(3000, ()=>console.log("Server running on port 3000"));
