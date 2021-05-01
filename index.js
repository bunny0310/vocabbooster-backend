const express = require("express");
const cors = require("cors");
//npm packages
const body_parser = require("body-parser");
const path = require("path");
const PORT = process.env.PORT||3000;
const session = require("express-session");
const router = require("./routes");

const app = express();

const url_prod = 'https://vocab-booster-ui.herokuapp.com,';
const validOrigins = [
];
app.use(cors({
    origin: (origin, callback) => {
        if (validOrigins.indexOf(origin) === -1) {
            callback(null, true)
          } else {
            callback(new Error('Not allowed by CORS'))
          }
    },
    credentials: true,
    allowedHeaders: 'Content-Type,Authorization'
  }));

// Origin verification generator
app.use(session({
    secret: 'secrettexthere',
    saveUninitialized: true,      
    resave: true,
    cookie : {
    sameSite: 'none',
    secure: true
  }
}));

app.use(body_parser.json())
app.use(express.static(path.join(__dirname,'/public')));
app.set('trust proxy', 1);

app.use('', router);
//listen 
app.listen(PORT, ()=>{
    console.log("Running on port ", PORT);
});