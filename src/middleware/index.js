const jwt=require("jsonwebtoken")
const User=require("../models/user")


var middleware={}

middleware.Auth= async function(req,res,next){
    try{
    //arpazo to token apo to header
    var token=req.header("Authorization").replace("Bearer ", "")
    //to apokodikopoiv thisismykey
    var decoded=jwt.verify(token, process.env.JWTKEY)
    //ψαχνω τον χρηστη με το id που ειχα αποθηκευμενο στο token//sos to deutero meros elegxei ean to 
    //συγκεκριμενο token ειναι ακομα στο array tou!!!!sososososso!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    var user=await User.findOne({_id:decoded.id, "tokens.token":token}) //, "tokens.token":token})
    
    if(!user){
        throw Error("pleasE authenticate")
    }
    //ean vro user ton prosueto sto antikeimon tou request kai to token sosss!!!!!!
    req.token=token
    req.user=user
    //console.log(req.user)
    next()
    }catch(e){
    res.send("problem with authentication")
    }
    
}

module.exports=middleware