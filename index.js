import express from "express";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import cors from "cors";
import colors from "colors";
import postRoutes from "./routes/posts.js";

const app = express();

dotenv.config();

app.use(bodyParser.json({ limit: "30mb", extented: true }));
// app.use(bodyParser.urlencoded({ limit: "30mb", extented: true })); // No Longer Needed
app.use(cors());

app.use("/posts", postRoutes);

// const CONNECTION_URL =
//   "mongodb+srv://zuhairmemories:captainamerica55443@cluster0.quhos.mongodb.net/?retryWrites=true&w=majority";
const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.CONNECTION_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() =>
    app.listen(PORT, () => console.log(`Server running on port: ${PORT}`))
  )
  .catch((error) => console.log(error.message));

// mongoose.set("useFindAndModify", false); // No Longer Needed
