const express = require('express')
const app = express()
const cors = require('cors')
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const Account = require("./models/Account.js");
const Exercise = require('./models/Exercise.js');

require('dotenv').config()

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(()=>console.log("Successfully Connected to MongoDB!"))
.catch(err=>console.error(err));


app.use(cors())
app.use(express.static('public'))
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

//post api endpoint to create a new user account
app.post("/api/users", async(req, res)=>{
  try {
    const username = req.body?.username;
    const user = new Account({
      username:username
    })
    const newUser = await user.save();
    res.status(200).json(newUser);
      
  } catch (error) {
    console.error(error)
    res.status(500).send("Something went wrong!");
  }
});

//returns a list of all users
app.get("/api/users", async(req, res)=>{
  try {
    const users = await Account.find({});
    res.status(200).json(users);
  } catch (error) {
    console.error(error);
    res.status(500).send("Something went wrong!");
  }
});

//post api to create a new exercise
app.post("/api/users/:_id/exercises", async(req, res)=>{
  try {
    const userId = req.params?._id;
    const {description, duration, date} = req.body;
    
    //query the user
    const user = await Account.findById(userId);

    const exercise = new Exercise({
      username: user?.username,
      description,
      duration,
      date: date ? new Date(date).toDateString() : new Date().toDateString()

    });

    const newExercise = await exercise.save();
    
    res.status(200).json({
      ...user.toObject(),
      ...newExercise.toObject()
    });
    
  } catch (error) {
    console.error(error);
    res.status(500).send("Something went wrong!");
  }
})

app.get("/api/users/:_id/logs", async (req, res) => {
  try {
    const userId = req.params?._id;
    const { limit, from, to } = req.query;

    // Query user account data
    const user = await Account.findById(userId);

    const query = { username: user.username };
    if (from) {
      const fromDate = new Date(from);
      if (isNaN(fromDate.getTime())) {
        throw new Error('Invalid "from" date format. Please use yyyy-mm-dd format.');
      }
      query.date = { $gte: fromDate };
    }
    if (to) {
      const toDate = new Date(to);
      if (isNaN(toDate.getTime())) {
        throw new Error('Invalid "to" date format. Please use yyyy-mm-dd format.');
      }
      query.date = { ...query.date, $lte: toDate };
    }

    // Conditionally set the options for limit
    const options = {};
    if (limit) {
      const parsedLimit = parseInt(limit);
      if (isNaN(parsedLimit) || parsedLimit < 0) {
        throw new Error('Invalid "limit" parameter. Please provide a non-negative integer.');
      }
      options.limit = parsedLimit;
    }

    const exercises = await Exercise.find(query, {
      description: 1,
      duration: 1,
      date: 1
    }, options);

    const countOfExercises = exercises.length;

    const response = {
      ...user.toObject(),
      count: countOfExercises,
      log: exercises
    };

    res.status(200).json(response);
  } catch (error) {
    console.error(error);
    res.status(500).json("Something went wrong!");
  }
});


app.get("/hello", async(req, res)=>{
  const query = await Account.find({});
  res.status(200).json(query);
})

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
