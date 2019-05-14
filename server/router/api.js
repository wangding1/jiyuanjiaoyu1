const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const Db = require("./db");
const md5 = require("js-md5");
const db = new Db("jiyunStudent");
const key = "天王盖地虎";

router.post("/login",(req,res,next)=>{
    console.log(req.body)
    db.find("userList",{query:req.body},(err,data)=>{
        if(err) throw err;
        console.log(data)
        if(data.length==0){
            res.send({
                state:0,
                code:"用户名与密码不匹配"
            })
        }else{
            console.log(1)
            let id = data[0]._id;
            let token = jwt.sign({id},key,{expiresIn:"7d"})
            console.log(token)
            console.log("-------------------------")
            res.send({
                state:1,
                code:{
                    uid:id,
                    tokenID:token
                }
            })
        }
    })
})









module.exports = router;