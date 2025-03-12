const express = require("express");
const bodyParser = require("body-parser")
const cors = require("cors")
const mongoose = require("mongoose")

const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');

const app = express();

app.use(express.json());
app.use(cookieParser());



dotenv.config();


const port = 3000;
const url = 'mongodb+srv://sarasavi:sarasavi@sarasavidrivingschool.8wcadpf.mongodb.net/?retryWrites=true&w=majority';


app.use(cors());
app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.send("Hello World!");
});

async function connectDB(url , connectionParams){
    
  await mongoose.connect(url , connectionParams);
  
  // console.log("DB Connected");
}

connectDB(url , {}).then(()=>{

  console.log("Database Connected");
  app.listen(port , ()=>{
      console.log("Listening on port 3000");
  });
}).catch((err)=>{
  console.error('Connection Error',err);
})



// app.listen(port, () => {
//   console.log(`Server is running on port ${port}`);
// });
