const express = require("express");
const cors = require("cors"); 
require("dotenv").config();

const app = express();
const port = process.env.PORT || 3000;

const allowedOrigins = [
  "https://os.netlabdte.com",
  "http://localhost:5173",
];

const corsOption = {
  origin: function (origin, callback) {
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE"]
};

app.use(cors(corsOption));

app.get("/", (req, res) =>{
  res.send("Cors already config with netlab domain and localhost"); 
});

app.use("/store", require("./src/routes/store.route"));
app.use("/user", require("./src/routes/user.route"));
app.use("/item", require("./src/routes/item.route"));
app.use("/transaction", require("./src/routes/transaction.route"));


app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});