const express=require("express")
const path=require("path")
const User=require("../models/user.js")
//gia to authentication
const middleware=require("../middleware")
// sharp gia to resizing tvn photo
const sharp=require("sharp")
//κανω require τις function για να στελω email
const myEmails=require("../emailFolder/account.js")
const Task=require("../models/task.js")
//upload files
const multer=require("multer")
//create instance and configure it
const upload=multer({//dest:"../avatar",// δεν θελω να το αποθηκευσω σε fileSystem αλλα σε database//des shmeivseis!!
                    limits:{
                        files:1,
                        fileSize: 5000000,
                            }, // η παρακάτω είναι η στανταρ μορφη του fileFilter
                    fileFilter(req, file, cb){
                        if (!file.originalname.match(/\.(png|jpeg|jpg)$/)){
                             return cb(new Error("please upload an image file"))   
                        }else{
                             return cb(undefined,true)}
                    }
                        })
// gia to populate tasks(virtual)
const router=new express.Router()

//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

//CREATE USERS//
router.post("/users", async (req,res)=>{
    try{
        //edo trexei kai to middleware to opoio hasharei kodiko
        var newUser= await User.create(req.body)
        //edo dhmiorgoume to token ΚΑΙ ΤΟ ΣΠΡΩΧΝΟΥΜΕ ΣΤΗΝ ARRAY
        var token=await newUser.generateToken()
        //στελνω welcome mail--sos einai asyncronous kai θα μπορουσα να βαλω await αλλα δεν χρειαζεται
        await myEmails.welcomeEmail(newUser.email, newUser.name)
               
        //χρησιμοποιω tojson sto model!!!!
        
        res.status(200).send({newUser, token})
    }catch(e){
        console.log(e)
        res.status(400).send(e)
    }
    })

    ///////sosososossoso paradeigma gia to image
router.get("/", (req,res)=>{
    res.sendFile(path.join(__dirname+"/image.html"))
})

    //GET USERS////
router.get("/users",middleware.Auth,async (req,res)=>{

    try{
        //Χρησιμοποιωντασ τη μεθοδο lean μετατρεπω τα documents σε objects πανω στο query!!!!!
        var allUsers= await User.find({}).lean()
        //ΠΡΙΝ ΣΤΕΙΛΩ ΠΙΣΩ ΤΟΥΣ ALLUSERS ΘΕΛΩ ΝΑ ΔΙΑΓΡΑΨΩ ΤΟ PASSWORD KAI TO EMAIL(NA MHN EMFANIZONTAI-SOS ΔΕΝ ΑΠΟΘΗΚΕΥΩ)
        allUsers.forEach((user)=>{
            delete user.password
            delete user.email
            delete user.tokens
            delete user.avatar
        })
        //to send μετατρεπει τα παντα σε json!!
        res.status(200).send(allUsers)
    }catch(e){
        res.status(400).send(e)
    }
})


//GET one USER (MONO TO DIKO MAS OΧΙ ΑΛΛΟ /:id////
router.get("/users/me",middleware.Auth, async (req,res)=>{
   // try{
        //var oneUser=await User.findById(req.params.id)
        
       // if (!oneUser){
        //    return res.status(404).send("user not found")
       // }
       
         //θυμισου την toJSON()
        res.status(200).send(req.user)
    //}catch(e){
        
       // res.status(500).send(e)
    //
    
})

//USER LOGIN//

router.post("/users/login", async (req, res)=>{
    // ΧΡΗΣΙΜΟΠΟΙΩ ΤΗΝ STATIC METHOD ΠΟΥ ΟΡΙΣΑ ΣΤΟ MODEL
    try{
        var founduser= await User.FindByCredentials(req.body.email, req.body.password)
        //edo dhmiorgoume to token
        var token=await founduser.generateToken()
        //console.log(founduser)
        if (!founduser){
            return res.status(404).send("user not found")
        }
        
        res.status(200).send({founduser,token})
       
    }catch(error){
        
        res.status(401).send(error.message)
    }   
})

//USER LOGOUT//
router.post("/users/logout",middleware.Auth, async (req, res)=>{
   
    try{
        //ΑΦΑΙΡΟΥΜΕ ΤΟ ΤΟΚΕΝ ΠΟΥ ΧΡΗΣΙΜΟΠΟΙΗΣΕ ΑΠΟ ΤΗΝ ARRAY TΩΝ ΤΟΚΕΝS(KANOYME XRHSH TOY REQ.USER KAI REQ.TOKEN APO AYTH)
        req.user.tokens=req.user.tokens.filter((val)=>{
            return val.token !== req.token
        })
        await req.user.save()

        res.status(200).send("LOGGED OUT")
       
    }catch(error){
        console.log(error.message)
        res.status(401).send(error.message)
    }
})

//USER LOGOUT-ALL//
router.post("/users/logoutall",middleware.Auth, async (req, res)=>{
   
    try{
        //ΑΦΑΙΡΟΥΜΕ ΤΟ ΤΟΚΕΝ ΠΟΥ ΧΡΗΣΙΜΟΠΟΙΗΣΕ ΑΠΟ ΤΗΝ ARRAY TΩΝ ΤΟΚΕΝS(KANOYME XRHSH TOY REQ.USER KAI REQ.TOKEN APO AYTH)
        req.user.tokens=[]
        
        await req.user.save()

        res.status(200).send("LOGGED OUT ALL")
       
    }catch(error){
        console.log(error.message)
        res.status(401).send(error.message)
    }
})


///////UPDATE USERS///////////////
router.patch("/users/me",middleware.Auth, async (req,res)=>{
    //edo tsekaro ean ta updated fields periexoun ta epitrpomena apo to schema//
    const updated=Object.keys(req.body)
    const allowed=["name", "email", "password", "age"]
    const isValid=updated.every((val)=>{
       return allowed.includes(val)
    })
    if (!isValid){
        return res.status(400).send("this value is not allowed") }
    try{
        // ΕΠΕΙΔΗ ΧΡΗΣΙΜΟΙΠΟΙΩ MIDDLEWARE TO OPOIO Η ΕΝΤΟΛΗ UPDATE TO KANEI BYPASS ΠΡΕΠΕΙ
        // ΝΑ ΓΡΑΨΩ ΤΟ UPDATE ROUTE MOY ΜΕ ΑΛΛΟ ΚΩΔΙΚΑ
        // var updatedUser=await User.findById(req.params.id)
        
        var updatedUser=await User.findById(req.user._id)
        if (!updatedUser){
            return res.status(404).send("user not found")
       }
        updated.forEach((val)=>{
            updatedUser[val]=req.body[val]
        })
        await updatedUser.save()

        //------ΠΑΛΙΟ ROUTE(den triggarei to save() kai genika den triggarei oute tous validatorss!!!!!!!))))--------///////
        //var updatedUser= await User.findByIdAndUpdate(req.params.id,req.body,{new:true, runValidators:true})

        
        res.status(200).send(updatedUser)
    }catch(e){
       
        res.status(404).send(e)
    }
})


///DELETE USERS//////
router.delete("/users/me",middleware.Auth, async (req,res)=>{
    try{
        //const deleted= await User.findByIdAndDelete(req.params.id)
       // var deleted= await User.findByIdAndDelete(req.user._id)
       //στελνω welcome mail--sos einai asyncronous kai θα μπορουσα να βαλω await αλλα δεν χρειαζεται
        await myEmails.byebeymail(req.user.email, req.user.name)
        //const deleted= await User.findByIdAndDelete(req.params.id)
       // var deleted= await User.findByIdAndDelete(req.user._id)
       await req.user.remove()
        //if (!deleted){
         //   return res.status(404).send("user not found")
       // }
        res.send("user deleted")
    }catch(e){
        console.log(e)
        res.send(e)
    }
})


//UPLOAD A PROFILE PICTURE
router.post("/users/me/avatar",middleware.Auth ,upload.single("avatar"), async(req,res)=>{ //to avatar edo einai to name tou pediou!!
    //kanoume resize thn photo kai thn metatrepoume se png//
    const newPhotoBuffer=await sharp(req.file.buffer).resize(200,200).png().toBuffer()
    req.user.avatar= newPhotoBuffer
    //req.user.avatar=req.file.buffer //edo pernoume to buffer tou antikeimenou
    await req.user.save()         
    res.send("ok :)")
}, (error, req, res, next)=>{  //to error handling tou muter einai idiatero
    res.status(400).send({error:error.message})
})

//DELETE A PROFILE PICTURE// OTAN ΑΠΛΑ ΑΝΕΒΑΖΟΥΜΕ ΜΙΑ ΚΑΙΝΟΥΡΙΑ ΤΟΤΕ Η ΠΑΛΙΑ ΑΝΤΙΚΑΘΙΣΤΑΤΑΙ ΑΠΟ ΤΗΝ ΚΑΙΝΟΥΡΙΑ -ΕΔΩ ΔΙΑΓΡΑΦΟΥΜΕ ΤΟ ΠΕΔΙΟ
router.delete("/users/me/avatar",middleware.Auth , async(req,res)=>{
    //ειναι ιδιο με το delete user.avatar αλλα εδω δεν ειναι object o req.user!!!!!!!!
    req.user.avatar=undefined
    await req.user.save()         
    res.send("ok :)")
}, (error, req, res, next)=>{  //to error handling tou muter einai idiatero
    res.status(400).send({error:error.message})
})

//SERVE THE PROFILE PICTURE 
// sososososo με αυτο το route όποις βάζει στο browser htpps//www.myapp.com/users/:id/avatar βλεπει την φωτο
//επομένως μπορουμε να βάλουμε το src είναι ίσο με το url αυτο και θα μας στειλει την φωτο

router.get("/users/:id/avatar", async(req,res)=>{
    //den valame authentication edo ara den exo prosbash ston req.user
    try{
    var fuser= await User.findById(req.params.id)
    if(!fuser || !fuser.avatar){
        throw new Error("user not found")
    }
    //setaro οπωσδηποτε τους headers για να ξερει τι παιρνει ο browser//logo sharp tis metatrepoume olesse png
    //o client browser den exei provlima na metatrepei to buffer se photo otan to lamvanei! (den ksero pos)
    res.set("Content-type", "image/png")
    res.send(fuser.avatar)

    }catch(e){
    res.status(400).send(e.message)
}
})

module.exports=router;