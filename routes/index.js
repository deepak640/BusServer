var express = require('express');
var router = express.Router();
const User = require('../Model/User');
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});
router.get('/home', async(req, res, next)=> {
  let data = await User.find()
  res.send(data)
});

module.exports = router;
