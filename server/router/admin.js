const express = require("express");
const router = express.Router();
const jwt= require("jsonwebtoken");
const Db = require("./db");
const db = new Db("jiyunStudent");
const key = "天王盖地虎";

router.use((req,res,next)=>{
    let obj = JSON.parse(req.headers.authorization);
    jwt.verify(obj.tokenID,key,(err,data)=>{
        if(err){
            res.status(401);
            res.send();
        }else{
            let id = data.id;
            if(obj.uid == id){
                next()
            }else{
                res.status(401);
                res.send();
            }
        }
    })
})

async function _option(id){
    let step1 = await new Promise((resolve,reject)=>{
        db.find("userOption",{query:{userID:id}},(err,data)=>{
            if(err){
                reject(err);
            }else{
                resolve(data[0]);
            }
            
        })
    })
    let step2 = await new Promise((resolve,reject)=>{
        db.findById("roleList",step1.rankID,(err,data)=>{
            if(err){
                reject(err)
            }else{
                resolve(data)
            }
        })
    })
    let step3 =await new Promise((resolve,reject)=>{
        db.find("menuList",{},(err,data)=>{
            if(err){
                reject(err)
            }else{
                let menuArr = data.filter((ele,index)=>{
                    if(ele.children){
                        ele.children = ele.children.filter((ele1,index1)=>{
                            if(ele1.children){
                                ele1.children=ele1.children.filter((ele2,index2)=>{
                                    return   step2.roleRank >= ele2.rankOpen
                                })
                            }
                            return step2.roleRank >= ele1.rankOpen
                        })
                    }
                    return step2.roleRank >= ele.rankOpen
                })
                resolve(menuArr)
            }
        })
    })
    return [step1,step2,step3]
}
router.get("/option",(req,res)=>{
    let obj = JSON.parse(req.headers.authorization);
    let id = obj.uid;
    console.log(id)
    _option(id).then(res1=>{
        res.send(res1)
    })
})

router.post("/isenter",(req,res)=>{
    let path = req.body.path;
    let id = JSON.parse(req.headers.authorization).uid;
    db.find("userOption",{query:{userID:id}},(err,data)=>{
        let userMsg = data[0];
        let rankID = userMsg.rankID;
        db.findById("roleList",rankID,(err,data)=>{
            let rank = data.roleRank;
            db.find("menuList",{},(err,data)=>{
                data.forEach((item,index)=>{
                    if(item.path){
                        if(item.path == path){
                            if(item.rankOpen<=rank){
                                res.send({
                                    state:"1",
                                    code:"success"
                                })
                            }else{
                                res.status(403);
                                res.send("err");
                            }
                        }
                    }else{
                        item.children.forEach((item2,index2)=>{
                            if(item2.path){
                                if(item2.path == path){
                                    if(item2.rankOpen<=rank){
                                        res.send({
                                            state:"1",
                                            code:"success"
                                        })
                                    }else{
                                        res.status(403);
                                        res.send("err");
                                    }
                                }
                            }else{
                                item2.children.forEach((item3,index2)=>{
                                    if(item3.path){
                                        if(item3.path == path){
                                            if(item3.rankOpen<=rank){
                                                res.send({
                                                    state:"1",
                                                    code:"success"
                                                })
                                            }else{
                                                res.status(403);
                                                res.send("err");
                                            }
                                        }
                                    }
                                })
                            }
                        })
                    }
                })
            })
        })
    })
})


module.exports = router;