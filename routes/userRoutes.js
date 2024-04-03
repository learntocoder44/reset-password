import express from "express";
import User from "./../models/user.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";

const router = express.Router();

router.post("/api/signup", async (req, res) => {
  try {
    const data = req.body;
    const newUser = new User(data);

    const response = await newUser.save();

    res.status(200).json(response);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error occurred while signing up" });
  }
});

router.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(400).json({ message: "Incorrect password" });
    }

    res.status(200).json({ message: "User logged in successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error occurred while logging in" });
  }
});

router.post("/api/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email: email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const token = jwt.sign({ id: user._id }, process.env.JWT, {
      expiresIn: "1d",
    });

    await User.findByIdAndUpdate(
      user._id,
      { verifytoken: token },
      { new: true },
    );
    const transporter = nodemailer.createTransport({
      service: "gmail",

      auth: {
        user: "durgamabhilash44@gmail.com",
        pass: "fpts czwi xzxa wwte",
      },
    });

    const mailOptions = {
      from: "durgamabhilash44@gmail.com",
      to: email,
      subject: "forgot password",
      text: `click to reset your password  https://f2dba823-dd22-474e-b439-b59c00c6bcab-00-3g8rl7aknpah3.sisko.replit.dev:3001/reset-password/${user._id}/${token}`,
    };
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error(error);
        return res
          .status(500)
          .json({ message: "Error occurred while sending email" });
      }
      console.log("Email sent successfully");
      res.status(200).json({ message: "Email sent successfully" });
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error occurred while sending mail" });
  }
});

router.get("/api/reset-password/:id/:token", async (req, res) => {
  try {
    const { id, token } = req.params;

    const decodedToken = jwt.verify(token, process.env.JWT);
    const user = await User.findOne({ _id: id, verifytoken: token });

    if (!user || !decodedToken) {
      return res
        .status(404)
        .json({ message: "User not found or token expired" });
    }

    res
      .status(200)
      .json({ message: "Valid token. Proceed with password reset." });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ message: "An error occurred while resetting password" });
  }
});

router.post("/api/reset-password/:id/:token", async (req, res) => {
  try {
    const { id, token } = req.params;
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ message: "Missing password field" });
    }

    // Find the user by ID and token
    const user = await User.findOneAndUpdate(
      { _id: id, verifytoken: token },
      {
        password: await bcrypt.hash(password, 10),
        verifytoken: undefined, // Remove the verifytoken after password reset
      },
      { new: true }, // To return the updated document
    );

    if (!user) {
      return res
        .status(404)
        .json({ message: "User not found or token expired" });
    }

    res.status(200).json({ message: "Password reset successful" });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ message: "An error occurred while resetting password" });
  }
});

export default router;
