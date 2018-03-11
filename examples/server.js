//
// Dependencies
//
const express = require('express');
const app = express();
//
// Set up server
//
app.set('port', process.env.PORT || 5000);
// serve all files in public as static files.
// since public/index.html looks for ../dist/index.js,
// giving the dist files the path prefix of dist ensures that they can be found.
app.use(express.static(__dirname));
app.use('/dist', express.static('dist'));

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});
