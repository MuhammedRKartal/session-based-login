import mongoose from "mongoose"

const Schema = mongoose.Schema

const userSchema = new Schema({
    name:{
        type:String,
        required:true,
    },
    surname:{
        type:String,
        required:true,
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    phone:{
        type:String,
        required:true,
        unique:true
    },
    sessionToken:{
        type:String,
        required:true
    },
    sessionExpiryDate:{
        type:String,
        required:true
    },
    loginToken:{
        type:String,
        required:true
    },
    loginTokenExpiryDate:{
        type:String,
        required:true
    }
    
})

const User = mongoose.model('User',userSchema)

export default User;