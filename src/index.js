const express=require("express")
//EMVIROMENTAL VARIABLES
require('dotenv').config()
//const mongoose = require('mongoose');
require("./db/mongoose")
//const User=require("./models/user")
//const Task=require("./models/task")
const UserRouters=require("./routes/user.js")
const TaskRouters=require("./routes/task.js")
const jwt=require("jsonwebtoken")

const app=express()

//edo dhmiorgitai to connection kai h database 
//mongoose.connect('mongodb://127.0.0.1:27017/task-manager-db', {useNewUrlParser: true, useCreateIndex:true});

//sos ΑΥΤΟ ΚΑΝΕΙ PARSE TO BODY ΓΙΑ JSON-->OBJECT
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

///ΓΙΑ ΝΑ ΧΡΗΣΙΜΟΠΟΙΕΙ ΤΟ APP το routers
app.use(UserRouters)
app.use(TaskRouters)

//mongoose.connect('mongodb://127.0.0.1:27017/task-manager-db', {useNewUrlParser: true, useCreateIndex:true});

//port envir variable
const port=process.env.PORT  //|| 3000







app.listen(port, ()=>{
    console.log("server up")
})



/*
// ΟΛΑ ΤΑ ROUTES ΜΕ PROMISES OXI ME ASYNC/AWAIT
//CREATE USERS//
app.post("/users",  (req,res)=>{

    User.create(req.body).then((newuser)=>{
        
        res.send(newuser)
    }).catch((error )=>{
        res.status(400).send(error)
    })
    
})

//CREATE TASKS
app.post("/tasks", (req,res)=>{
   
    Task.create(req.body).then((newtask)=>{
        
        res.send(newtask)

    }).catch((error )=>{

        res.status(400).send(error)
    })
    
})

//GET USERS////
app.get("/users", (req,res)=>{
    User.find({}).then((users)=>{
        res.send(users)
    }).catch((e)=>{
        res.status(400).send(e)
    })
})

//GET one USER////
app.get("/users/:id", (req,res)=>{
    User.findById(req.params.id).then((user)=>{
        if(!user){
            res.status(404).send()
        }else{
            res.send(user)
        }        
    }).catch((e)=>{
        res.status(500).send(e)
    })
})

//GET TASKS////
app.get("/tasks", (req,res)=>{
    Task.find({}).then((tasks)=>{
        res.send(tasks)
    }).catch((e)=>{
        res.status(400).send(e)
    })
})

//GET one TASK////
app.get("/tasks/:id", (req,res)=>{
    Task.findById(req.params.id).then((task)=>{
        if(!task){
            res.status(404).send()
        }else{
            res.send(task)
        }        
    }).catch((e)=>{
        res.status(500).send(e)
    })
})

*/