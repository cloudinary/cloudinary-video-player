const express = require('express');
const path = require('path');
const app = express();
const PORT = 3000;

//when we get /cloudinary-video-player we serve /docs
app.use('/cloudinary-video-player', express.static('docs'));

app.listen(PORT);
console.log('server up on', 'http://localhost:' + PORT);
