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
    const { name, email, password, type } = req.body;
    // Check if user already exists
    let existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new teacher
    const newUser = new User({ name, email, password: hashedPassword, type });
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
    return res.status(401).json({ error: 'Invalid Email' });
  }
  const isMatch = await bcrypt.compare(password, existing.password);
  if (!isMatch) {
    return res.status(401).json({ error: 'Invalid Password' });
  }
  JWT.sign({ id: existing._id }, process.env.USER_KEY, (err, token) => {
    if (err) {
      res.json({ error: "somthing went wrong" })
    }
    res.json({ auth: token })
  })
})
module.exports = router;
