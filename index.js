const express = require("express");
const bodyParser = require("body-parser")
const cors = require("cors")
const mongoose = require("mongoose");

const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const authRoutes  = require('./src/routes/authRoutes');
const vehicleRoutes = require('./src/routes/vehicleRoutes');
const physicalTrainingRoutes = require('./src/routes/physicalTrainingRoutes');
const enrollPTSRoutes = require('./src/routes/enrollPTSRoutes');
const app = express();

app.use(express.json());
app.use(cookieParser());


dotenv.config();


const port = 3000;
// const uri = 'mongodb+srv://dinna:j5Q68VChnQOOt4BH@cluster0.avg74jj.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
const uri = process.env['MONGO_URI'];


app.use(cors());
app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.send("Hello Dinna");
});


// // Create a MongoClient with a MongoClientOptions object to set the Stable API version
// const client = new MongoClient(uri, {
//   serverApi: {
//     version: ServerApiVersion.v1,
//     strict: true,
//     deprecationErrors: true,
//   }
// });
// async function connectDB() {
//   try {
//     // Connect the client to the server	(optional starting in v4.7)
//     await client.connect();
//     // Send a ping to confirm a successful connection
//     await client.db("admin").command({ ping: 1 });
//     console.log("Pinged your deployment. You successfully connected to MongoDB!");
//   } finally {
//     // Ensures that the client will close when you finish/error
//     await client.close();
//   }
// }
// // run().catch(console.dir);

// connectDB().then(()=>{

//   console.log("Database Connected");
//   app.listen(port , ()=>{
//       console.log("Listening on port 3000");
//   });
// }).catch((err)=>{
//   console.error('Connection Error',err);
// })
mongoose.connect(uri)
  .then(() => {
    console.log("MongoDB connected using Mongoose");
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  })
  .catch(err => {
    console.error('Connection Error', err);
  });

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/physical-training', physicalTrainingRoutes);
app.use('/api/enroll-pts', enrollPTSRoutes);


