const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const port = 4000;
const app = express();

const usersRoute = require("./Routes/usersRoute.js");
const productsRoute = require("./Routes/productsRoute.js")
const ordersRoute = require("./Routes/ordersRoute.js")

mongoose.set('strictQuery',true);
// MongoDB COnnection
mongoose.connect("mongodb+srv://admin:admin@batch245-man-awit.8gpp4b2.mongodb.net/batch245_Capstone2_ManAwit?retryWrites=true&w=majority", {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })

    let db = mongoose.connection;

     // error handling
     db.on("error", console.error.bind(console, "Connection error!"));

     // Validation of the connection
     db.once("open", ()=> console.log("We are connected to the cloud!"))
 

// Middlewares
app.use(express.json());
app.use(express.urlencoded({extended: true})); 
app.use(cors());

app.use("/users", usersRoute);
app.use("/products", productsRoute);
app.use("/orders", ordersRoute)







app.listen(port, ()=> console.log(`Server is running at port ${port}!`))