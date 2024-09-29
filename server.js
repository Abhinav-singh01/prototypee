


const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const cors = require('cors');
const nodemailer = require('nodemailer');
require('dotenv').config();
const path = require('path');
const authMiddleware = require('./middleware/authMiddleware');
const app = express();
const randomstring=require('randomstring')
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));  // Serve static files



// MongoDB Connection
mongoose.connect('mongodb://localhost:27017/authentication', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("MongoDB Connected"))
    .catch(err => console.log("Error connecting MongoDB:", err));

// User Schema and Model
const UserSchema = new mongoose.Schema({
    firstName: String,
    lastName: String,
    email: { type: String, unique: true, required: true },
    password: String
});

const User = mongoose.model('User', UserSchema);




app.get('/',(req,res)=>{
  res.sendFile(path.join(__dirname,'public','index.html'))
})


app.get('/homepage.html', authMiddleware, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'homepage.html')); // Serve the homepage.html file after authentication
});


app.get('/logout', (req, res) => {
  res.clearCookie('token'); // Clear the authentication token cookie
  res.redirect('/'); // Redirect to the login page
});
// JWT secret
const JWT_SECRET = process.env.JWT_SECRET || '123456';

// Routes

// Register Route
app.post('/signup', async (req, res) => {
    const { email, password, firstName, lastName } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = new User({
            firstName,
            lastName,
            email,
            password: hashedPassword
        });

        await user.save();
        res.status(201).json({ message: 'User created successfully' });
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ error: 'User could not be created' });
    }
});

// Login Route
// Login Route
app.post('/signin', async (req, res) => {
  const { email, password } = req.body;

  try {
      const user = await User.findOne({ email });
      if (!user) {
          return res.status(400).json({ message: 'User not found' });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
          return res.status(400).json({ message: 'Incorrect password' });
      }

      const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '1h' });

      
      res.status(200).json({
          token,
          message: 'Login successful'
      });
  } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Unable to log in' });
  }
});


// Forgot Password Route
app.post('/forgotPassword', async (req, res) => {
    const { email } = req.body;
    console.log('Received forgotPassword request for:', email); // Debugging: Log the incoming email

    try {
        // Log database connection attempt
        console.log('Attempting to find user in the database...');
        const user = await User.findOne({ email });
        
        if (!user) {
            console.error('User not found:', email); // Debugging: Log if user not found
            return res.status(400).json({ message: 'User not found' });
        } else {
            // Generate a random string
            const randomString = randomstring.generate();
            console.log('Generated reset token:', randomString); // Debugging: Log the reset token

            // Update user with the new token
            const updateResult = await User.updateOne({ email: email }, { $set: { token: randomString } });

            // Check if the update was successful
            if (updateResult.nModified === 0) {
                console.error('Error updating user with reset token');
                return res.status(500).json({ error: 'Could not update user with reset token' });
            }

            // Send the email
            const emailSent = await sendemail(user.firstName, user.email, randomString); // Assuming sendemail is a promise
            if (emailSent) {
                res.status(200).json({ success: true, msg: 'Please check your inbox' });
            } else {
                res.status(500).json({ error: 'Could not send reset email' });
            }
        }
    } catch (error) {
        console.error('Error during password reset:', error); // Debugging: Log unexpected errors
        res.status(500).json({ error: 'Could not process password reset' });
    }
});

// Email sending function
async function sendemail(firstName, email, token) {
    try {
        // Setup your transporter
        const transporter = nodemailer.createTransport({
            service: 'gmail', 
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        // Email options
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Password Reset',
            text: `Hello ${firstName},\n\nPlease use the following link to reset your password: http://localhost:3000/resetpassword/${token}\n\nRegards,\nYour Team`
        };

        // Send email
        await transporter.sendMail(mailOptions);
        console.log('Email sent successfully');
        return true;
    } catch (error) {
        console.error('Error sending email:', error);
        return false;
    }
}

app.post('/resetpassword', async (req, res) => {
  const { token, newPassword } = req.body;

  try {
      const decoded = jwt.verify(token, JWT_SECRET);
      const user = await User.findById(decoded.userId);

      if (!user) {
          return res.status(400).json({ message: 'Invalid token or user not found' });
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      user.password = hashedPassword;
      await user.save();

      res.status(200).json({ message: 'Password updated successfully' });
  } catch (error) {
      console.error('Error resetting password:', error);
      res.status(500).json({ error: 'Could not reset password' });
  }
});


// Start Server
const PORT = process.env.PORT || 3000;






app.get('/api/user', authMiddleware, async (req, res) => {
  try {
      const userId = req.user.userId;
      const user = await User.findById(userId);

      if (!user) {
          return res.status(404).json({ error: 'User not found' });
      }

      res.json({
          user: {
              firstName: user.firstName,
              lastName: user.lastName,
              email: user.email
          }
      });
  } catch (error) {
      console.error('Error fetching user data:', error);
      return res.status(500).json({ error: 'Error fetching user data' });
  }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);

});
