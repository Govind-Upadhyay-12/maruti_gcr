const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const logger = require("morgan");
const db=require("./Db/index")
const routes=require("./routes/index")
const path=require("path")
dotenv.config();
const app = express();
db().then(() => {
  console.log("start ur work🏹");
}).catch((error) => {
  console.error("Error connecting to the database:", error);
  process.exit(1); 
});

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(logger("dev"));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use("/admin", express.static(path.join(__dirname, "./admin/dist/admin")));
app.get(/\/admin\/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, "./admin/dist/admin/index.html"));
});
app.use('/api/v1',routes);
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});


app.listen(3000, () => {
  console.log(`Server is running on port ${3000}`);
});