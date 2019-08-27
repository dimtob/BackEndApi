const express=require("express")
const Task=require("../models/task.js")
// gia to populate
const User=require("../models/user.js")
//gia to middleware
const middleware=require("../middleware")

var router=new express.Router()


//CREATE TASKS
router.post("/tasks",middleware.Auth, async (req,res)=>{
   
    try{
        //αποθηκευω και τον id tou xrhsth san owner
        var newTask=await Task.create({...req.body, owner:req.user._id})
        res.status(201).send(newTask)
    }catch (e){
        res.status(400).send(e)
    }
    
    
})

//GET TASKS////
//tasks?limit=3&skip=1&sortBY=description_asc
router.get("/tasks", middleware.Auth, async (req,res)=>{
    try{
        //μας επιστρέφει τα tasks του συγκεκριμένου χρήστη-2 τροποτ
        //1 var allTasks=await Task.find({owner:req.user._id})
        //επίσης υπάρχει και η επιλογή για query string
        var match={}
        var sort={}
        if (req.query.completed){
            match.completed=req.query.completed==="true"
        }
        if (req.query.sortBY){
            var parts=req.query.sortBY.split("_")
            sort[parts[0]]=parts[1]==="desc"?-1:1
        }
        //gia to limit kai skip δεν χρειαζεται αμυντικος προγραμματισμος
        await req.user.populate({path:"myTasks",
                                match,
                                options: {
                                     limit: parseInt(req.query.limit),
                                     skip: parseInt(req.query.skip),
                                     sort                                   
                                } 
        }).execPopulate()
        if(req.user.myTasks.length===0){
            return res.status(404).send("no tasks exist")
        }

        //var allTasks=await Task.find({})
        res.status(201).send(req.user.myTasks)
    }catch(e){
        res.status(500).send(e)
    }
    
})

//GET one TASK////
router.get("/tasks/:id", middleware.Auth,async (req,res)=>{
    try{
        //μας επιστρέφει ένα task μόνο εαν ο χρηστης είναι και ο ιδιοκτήτης
        //var oneTask=await Task.findById(req.params.id).populate("owner").execPopulate()
        var oneTask=await Task.findOne({_id:req.params.id, owner:req.user._id})
        if (!oneTask){
            res.status(404).send("task not found")
        }
        res.status(201).send(oneTask)
    }catch(e){
        res.status(500).send("problem")
    }
    
    
})

///////UPDATE TASKS///////////////
router.patch("/tasks/:id", middleware.Auth, async (req,res)=>{
    const updated=Object.keys(req.body)
    console.log(updated)
    const allowed=["completed", "description"]
    const isValid=updated.every((val)=>{
        return allowed.includes(val)
    })
    if (!isValid){
        return res.status(500).send("this value is not allowed")
    }
    
    try{
        //ψαχνω και τον owner
        
        var updatedtask=await Task.findOne({_id:req.params.id, owner:req.user._id})

        if (!updatedtask){
            return res.status(404).send("user not found")
        }
        updated.forEach((val)=>{
            updatedtask[val]=req.body[val]
        })
        
        await updatedtask.save()
        //ΠΑΛΙΟΣ ΤΡΟΠΟ ΓΙ UPDATE Ο ΟΠΟΙΟΣ ΔΕΝ ΚΑΝΕΙ TRIGGER TO SAVE KAI ARA TO MIDDLEWARE
        //var updatedtask= await Task.findByIdAndUpdate(req.params.id,req.body,{new:true, runValidators:true})
        res.status(200).send(updatedtask)
    }catch(e){
        res.status(500).send(e)
    }
})

///DELETE TASKS//////
router.delete("/tasks/:id",  middleware.Auth,async (req,res)=>{
    try{
        console.log(req.params.id)
        console.log(req.user._id)
        var task= await Task.findOne({_id:req.params.id, owner:req.user._id})
        console.log(task)
        if (!task){
            return res.status(404).send("task not found")
        }
       await task.remove()
        res.send("tasked removed")
    }catch(e){
        res.send(e)
    }
})

module.exports=router;