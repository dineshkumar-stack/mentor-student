const express = require("express");
const mongoose = require("mongoose");
const app = express();
const mongodb = require("mongodb");
const mongoclient = mongodb.MongoClient;
const dotenv = require("dotenv").config();
const URL = process.env.DB;
app.use(express.json());

// DB connection setup
const dbConnect = async () => {
  mongoose.set("strictQuery", false);
  try {
    await mongoose.connect(URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      autoIndex: true,
    });
    console.log("MongoDB Connected Status: Active");
  } catch (e) {
    console.log(e.message, "error in connecting db");
  }
};
dbConnect();

// Local server setup
const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`*****Server Running on Port ${PORT}*****`);
});

// mmentor create
app.post("/mentor", async (req, res) => {
  try {
    const connection = await mongoclient.connect(URL);
    const db = connection.db("assignment");
    const mentor = await db.collection("mentors").insertOne(req.body);
    await connection.close();
    res.json({ message: "Mentor created", id: mentor.insertedId });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
});

// Student create
app.post("/student", async (req, res) => {
  try {
    const connection = await mongoclient.connect(URL);
    const db = connection.db("assignment");
    const student = await db.collection("students").insertOne(req.body);
    await connection.close();
    res.json({ message: "Student created", id: student.insertedId });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
});

// get mentor information
app.get("/mentor", async (req, res) => {
  try {
    const connection = await mongoclient.connect(URL);
    const db = connection.db("assignment");
    const mentor = await db.collection("mentors").find({}).toArray();
    await connection.close();
    res.json(mentor);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
});

// get student information
app.get("/student", async (req, res) => {
  try {
    const connection = await mongoclient.connect(URL);
    const db = connection.db("assignment");
    const student = await db.collection("students").find({}).toArray();
    await connection.close();
    res.json(student);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
});

// assign student to a mentor
app.put("/assign_student/:id", async (req, res) => {
  try {
    const connection = await mongoclient.connect(URL);
    const db = connection.db("assignment");
    const mentordata = await db
      .collection("mentors")
      .findOne({ _id: mongodb.ObjectId(req.params.id) });
    if (mentordata) {
      delete req.body._id;
      const mentor = await db
        .collection("mentors")
        .updateOne(
          { _id: mongodb.ObjectId(req.params.id) },
          { $set: req.body }
        );
      await connection.close();

      res.json(mentor);
    } else {
      res.status(404).json({ message: "mentor not found" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
});

// show all students of particular mentor

app.get("/mentor_student/:id", async (req, res) => {
  try {
    const connection = await mongoclient.connect(URL);
    const db = connection.db("assignment");
    const mentor = await db
      .collection("mentors")
      .findOne({ _id: mongodb.ObjectId(req.params.id) });
    await connection.close();
    if (mentor) {
      res.json(`students name : ${mentor.student} assigned to ${mentor.name}`);
    } else {
      res.status(404).json({ message: "Mentor not found" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
});

// assign or change mentor for student

app.put("/change_mentor/:id", async (req, res) => {
  try {
    const connection = await mongoclient.connect(URL);
    const db = connection.db("assignment");
    const studentdata = await db
      .collection("students")
      .findOne({ _id: mongodb.ObjectId(req.params.id) });
    if (studentdata) {
      delete req.body._id;
      const student = await db
        .collection("students")
        .updateOne(
          { _id: mongodb.ObjectId(req.params.id) },
          { $set: req.body }
        );
      await connection.close();

      res.json(student);
    } else {
      res.status(404).json({ message: "Student not found" });
    }
    res.json(student);
    await connection.close();
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
});
