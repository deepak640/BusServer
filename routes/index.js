var express = require('express');
var router = express.Router();
const User = require('../Model/User');
const JWT = require('jsonwebtoken')
const nodemailer = require('nodemailer')
const bcrypt = require('bcryptjs')
/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' });
});
router.get('/home', async (req, res, next) => {
  let data = await User.find()
  res.send(data)
});

router.post("/send-email", (req, res) => {
  const { to, subject, emailhtml } = req.body;

  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL,
      pass: process.env.PASS,
    },
    tls: {
      rejectUnauthorized: false
    },
    from: process.env.EMAIL,
  });

  const mailOptions = {
    from: 'My Company <noreply@example.com>',
    to,
    subject,
    html: emailhtml,
  };

  transporter.sendMail(mailOptions, (err, info) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: "Error sending email" });
    } else {
      res.json({ message: "Email sent successfully" });
    }
  });
});

router.post('/sendpasswordlink', async (req, res) => {
  const { Email } = req.body
  if (!Email) {
    res.status(401).json({ message: "Enter Your Email" })
  }
  const user = await User.findOne({ email: Email })
  console.log("🚀 ~ file: index.js:56 ~ router.post ~ user:", user)
  try {
    if (!user) {
      return res.status(400).json({message : "User not registered"})
    } else {
      const token = JWT.sign({ id: (user._id) }, process.env.USER_KEY, { expiresIn: '240s' })
      if (token) {
        const transporter = nodemailer.createTransport({
          host: "smtp.gmail.com",
          port: 587,
          secure: false,
          auth: {
            user: process.env.EMAIL,
            pass: process.env.PASS,
          },
          tls: {
            rejectUnauthorized: false
          },
          from: process.env.EMAIL,
        });
        const mailOptions = {
          from: 'My Company <noreply@example.com>',
          to: Email,
          subject: "Sending Email For password Reset",
          html: `<h3>This Link For 2 Minutes</h3><br/> ${process.env.LINK}/forgotpassword?token=${token}`,
        };

        transporter.sendMail(mailOptions, (err, info) => {
          if (err) {
            console.error(err);
            res.status(500).json({ error: "Error sending email" });
          } else {
            res.json({ message: "Email sent successfully" });
          }
        });
      }
    }
  } catch (error) {
    console.log(error)
  }
})


router.post('/:token', async (req, res) => {
  const { Password } = req.body;
  console.log("🚀 ~ file: index.js:101 ~ router.post ~ Password:", Password)
  const { token } = req.params;

  try {
    const decodedToken = JWT.verify(token, process.env.USER_KEY);
    const userId = decodedToken.id;

    let user = await User.findOne({ _id: userId });
    if (!user) {
      return res.status(400).json({message:"User not exist"})
    }
    const encryptedPass = await bcrypt.hash(Password, 10);
    const updatedUser = await User.findByIdAndUpdate({ _id: userId }, { password: encryptedPass });
    console.log("🚀 ~ file: index.js:113 ~ router.post ~ updatedUser:", updatedUser)

    if (updatedUser) {
      res.json({ message: 'Password changed' });
      console.log("changed")
    } else {
      res.json({ error: "Failed to update password" });
      console.log("error")
    }
  } catch (error) {
    console.log(error);
    res.json({ error: "Token verification failed" });
  }
});
module.exports = router;
