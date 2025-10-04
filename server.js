require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('cookie-session');
const path = require('path');

// Routes
const shopRoutes = require('./routes/shop');
const cartRoutes = require('./routes/cart');
const checkoutRoutes = require('./routes/checkout');
const settingsRoutes = require('./routes/settings');
const successRoutes = require('./routes/success');
const cancelRoutes = require('./routes/cancel');

const app = express();

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(
  session({
    name: 'session',
    keys: [process.env.SESSION_SECRET || 'secret'],
    maxAge: 24 * 60 * 60 * 1000, // 1 day
  })
);

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI || 'mongodb://localhost:27017/ewodrip', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('🖤 MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Routes (with prefixes)
app.use('/', shopRoutes);
app.use('/cart', cartRoutes);
app.use('/checkout', checkoutRoutes);
app.use('/settings', settingsRoutes);
app.use('/success', successRoutes);
app.use('/cancel', cancelRoutes);

// 404 Page
app.use((req, res) => {
  res.status(404).render('layout', {
    title: '404 | EwoDrip',
    cartCount: 0,
    content: '<h1 class="text-center gothic-title">404 - Page not found 🕸️</h1>',
  });
});

// Server Start
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🕷️ Server running at http://localhost:${PORT}`));


