const express =require("express");
const http = express();
const api = require("./router/api");
const admin = require("./router/admin");
const bodyParser = require("body-parser")
http.listen(8080,()=>{
    console.log("server is runing")
});
http.use(bodyParser.urlencoded({extended:false}));
http.use("/api",api);
http.use("/admin",admin);