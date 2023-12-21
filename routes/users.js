var express = require('express');
var router = express.Router();
var bcrypt = require('bcryptjs')
var User = require('../Model/User')
const JWT = require('jsonwebtoken')
const authenticateToken = require('../middleware/auth');

/* GET users listing. */
router.get('/', function (req, res, next) {
  res.send('respond with a resource');
});

router.post('/register', async (req, res) => {
  try {
    const { name, email, password, type, position, phone, licence, company } = req.body;
    // Check if user already exists
    let existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    let newUser
    // Create new user
    switch (type) {
      case 'RTO':
        newUser = new User({ name, position, email, phone, licence, password: hashedPassword, type })
        console.log("RTO")
        break;
      case 'manager':
        console.log("manager")
        newUser = new User({ name, email, phone, licence, company, password: hashedPassword, type })
        break;
      case 'general':
        console.log("general")
        newUser = new User({ name, email, phone, password: hashedPassword, type })
      default:
        break;
    }
    // Save teacher to database
    const user = await newUser.save();

    // Create and sign JWT token
    JWT.sign({ id: user._id }, process.env.USER_KEY, (err, token) => {
      if (err) {
        res.json({ error: "somthing went wrong" })
      }
      res.json({ auth: token })
    })
  } catch (error) {
    console.error(error.message);
    res.status(500).send(error);
  }
})

router.post('/Login', async (req, res) => {
  const { email, password } = req.body;
  let existing = await User.findOne({ email })
  if (!existing) {
    return res.status(401).json({ error: 'Invalid Credentials' });
  }
  const isMatch = await bcrypt.compare(password, existing.password);
  if (!isMatch) {
    return res.status(401).json({ error: 'Invalid Credentials' });
  }
  JWT.sign({ id: existing._id }, process.env.USER_KEY, (err, token) => {
    if (err) {
      res.json({ error: "somthing went wrong" })
    }
    res.json({ auth: token })
  })
})
module.exports = router;
