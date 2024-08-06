const express = require('express');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Load routes from the routes/index.js file
const routes = require('./routes/index');

// Use the routes in the Express app
app.use('/', routes);

// Listen on the specified port or default to 5000
const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
