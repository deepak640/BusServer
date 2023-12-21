var express = require('express');
var router = express.Router();
const User = require('../Model/User');
const JWT = require('jsonwebtoken')
const nodemailer = require('nodemailer')

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
  try {
    const user = await User.findOne({ email: Email })
    if (user) {
      const token = JWT.sign({ id: (user._id) }, process.env.USER_KEY, { expiresIn: '120s' })
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

router.get('/forgotpassword/:token', async (req, res) => {
  const { token } = req.params
  try {
    const decodedToken = JWT.verify(token, process.env.USER_KEY);
    const userId = decodedToken.id;
    const user = await User.findOne({ _id: userId })
    if (user) {
      res.status(200).json(user)
    } else {
      res.status(401).json({ error: "user not exist" })
    }
  } catch (error) {
    console.log(error)
  }
})

router.post('/:token', async (req, res) => {
  const { Password } = req.body;
  const { token } = req.params;

  try {
    const decodedToken = jwt.verify(token, process.env.USER_KEY);
    const userId = decodedToken.id;

    // Find user in the Teacher collection
    let user = await User.findOne({ _id: userId });

    const encryptedPass = await bcrypt.hash(Password, 10);
    const updatedUser = await user.findByIdAndUpdate({ _id: userId }, { password: encryptedPass });

    if (updatedUser) {
      res.json({ message: 'Password changed for' });
    } else {
      res.json({ error: "Failed to update password" });
    }
  } catch (error) {
    console.log(error);
    res.json({ error: "Token verification failed" });
  }
});
module.exports = router;
