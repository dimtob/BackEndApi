const mongoose = require('mongoose');


mongoose.connect(process.env.DATABASE, {useNewUrlParser: true, useCreateIndex:true,
useFindAndModify:false});






/*

/////CREATE MODELS///////////////////
const User = mongoose.model('User', userSchema)
const Task=mongoose.model("Task", taskSchema)





const toi = new User({ name:"giorgos", age:10, email:"adada@example.com" })

toi.save().then(()=>{
    console.log("saved")
}).catch((error)=>{
    console.log(error)
})
const task1=new Task({description:"buy clothes", completed:false})

task1.save().then(()=>{
    console.log("saved")
}).catch((error)=>{
    console.log(error)
})


var string = "    This    should  become   something          else   too . ";
string = string.replace(/\s+/g, " ");
*/
