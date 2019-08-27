const mongoose = require('mongoose');
const validator=require("validator")
const bcrypt=require("bcryptjs")
const jwt=require("jsonwebtoken")
const Task=require("../models/task.js")



///// USER SCHEMA///////////////////////////
const userSchema=new mongoose.Schema({ 
    name:{
        type:String,
        unique:true,
        trim: true,
        required:true
    },
    age:{
        type:Number,
        default: 0,
        validate(value){
            if(value<0){
                throw new Error("value negative")
            }
        }
    },
    email:{
        type:String,
        unique:true,
        required:true,
        trim: true,
        lowercase:true,
        validate(value){
            if(!validator.isEmail(value)){
                throw new Error("not valid email")
            }
        }
    },
    password:{
        type:String,
        required:true,
        trim: true,
        minlength:6,
        validate(value){
            if(value.toLowerCase().includes("password")){
                throw new Error("do not incled password")
            }
        }
    },
   
    tokens:[
        {
            token:{
                type: String,
                required:true
            }
                
            }
        
    ], 
    avatar:{
        type:Buffer
            } 
}
 ,{
    timestamps:true
})
    //με τα παρακάτω οποτεδηποτε κανουμε user documents json h objects κανουν αυτοματο populate τα virtuals!!
    //userSchema.set('toObject', { virtuals: true });
    //userSchema.set('toJSON', { virtuals: true });

    
    

    //SOS VIRTUALS POPULATE
    userSchema.virtual("myTasks", {
        ref: "Task",
        localField: "_id",
        foreignField: "owner"
    })
    
    
    ///sos methods sto schema-model
    //1
    userSchema.methods.sayHi=function(){
        return "hi to me"+this.name
    }



    //2 ΔΗΜΙΟΥΡΓΙΑ ΤΟΚΕΝ ΟΤΑΝ ΚΑΝΟΥΜΕ CREATE A NEW USER H LOGIN
    userSchema.methods.generateToken=async function(){
        //generate a token
        var token= jwt.sign({id:this._id}, process.env.JWTKEY) //,{expiresIn: "5 min"})
        //push it in the array
        //this.tokens=this.tokens.concat({token})
        
        this.tokens.push({token:token})
        //save user with new token
        await this.save()
        return token

    }

    //3 ΜΕΘΟΔΟΣ ΤΟJSON() ΩΣΤΕ ΝΑ ΣΤΕΛΝΟΥΜΕ ΤΟΝ USER XΩΡΙΣ ΕΥΑΙΣΘΗΤΑ ΣΤΟΙΧΕΙΑ    
    userSchema.methods.toJSON=function(){
        //με τα παρακάτω οποτεδηποτε κανουμε user documents json κανουν αυτοματο populate τα virtuals!!
        //await this.populate("myTasks").execPopulate()
       
        //prota to metatrepo se object giati ena document den einai object
        var objectUser=this.toObject()
        delete objectUser.password
        delete objectUser.email
        delete objectUser.tokens
        delete objectUser.avatar
        

        return objectUser
    }


    


    //STATIC METHOD ΓΙΑ ΝΑ ΚΑΝΟΥΜΕ LOGIN-- STO USER/LOGIN ROUTE
    userSchema.statics.FindByCredentials=async (email, password)=>{
       
        var searcheduser=await User.findOne({email:email})
        var isMatch= await bcrypt.compare(password, searcheduser.password)
        if (!searcheduser){
            throw Error("unable to login")
        }else if (!isMatch){
            throw Error("unable to login")
        }else{
            return searcheduser 
           }
                    
      }


    /// user Schema MIDDLEWARE-ΠΡΙΝ ΤΗΝ ΑΠΟΘΗΚΕΥΣΗ HASHAROUME PASSWORD KAI TO KANOYME SAVE!!!!!!!////
    //ΠΡΙΝ ΤΗ ΔΙΑΓΡΑΦΗ ΣΒΗΝΟΥΜΕ ΟΛΑ ΤΑ ΤΑSKS ΤΟΥ ΣΥΓΚΕΚΡΙΜΕΝΟΥ ΧΡΗΣΤΗ

    userSchema.pre("save", async function(next){
        // orizoume to this
        var user=this
        //ean kanoume modify to password eite sto create eite sto update
        if(user.isModified("password")){
            user.password= await bcrypt.hash(user.password,8)
        }
        next()
    })

    userSchema.pre("remove", async function(next){
        //πριν την αφαιρεση του χρηστη αφαιρουμε τα tasks του
        await Task.deleteMany({owner:this._id})
        next()
    })

    const User=mongoose.model('User', userSchema)

    module.exports=User