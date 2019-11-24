const express = require('express');
const app = express();
const path = require('path');
const router = express.Router();

router.get('/', function (req, res) {
    res.sendFile(path.join(__dirname + '/index.html'));
});

router.get('/game.html', function (req, res) {
    res.sendFile(path.join(__dirname + '/game.html'));
});

router.get('/css/styles.css', function (req, res) {
    res.sendFile(path.join(__dirname + '/css/styles.css'));
});

router.get('/css/tabs.css', function (req, res) {
    res.sendFile(path.join(__dirname + '/css/tabs.css'));

});
router.get('/js/game.js', function (req, res) {
    res.sendFile(path.join(__dirname + '/js/game.js'));
});
router.get('/js/tabs.js', function (req, res) {
    res.sendFile(path.join(__dirname + '/js/tabs.js'));
});

app.use('/', router);
app.listen(3000);

console.log("Listening on port 3000");