const jwt = require("jsonwebtoken");
const secret = "CapstoneManAwit";

// Creating Token
module.exports.createAccessToken = (user) => {
    const data = {
        _id: user._id,
        email: user.email,
        isAdmin: user.isAdmin
    }

    return jwt.sign(data, secret, {});
}

// Verify Token
module.exports.verify = (request, response, next) => {
   
    let token = request.headers.authorization;

    if(typeof token !== "undefined"){
        token = token.slice(7, token.length);
        // console.log(token);

        return jwt.verify(token, secret, (err, data)=>{
            if(err){
                return response.send({auth: "Failed"});
            }
            else{
                next();
            }
        })

    }
    else{
        return response.send({auth: "Failed"})
    }
}


// Token decryption

    module.exports.decode = (token) => {
        // Token received is not undefeined
        if(typeof token !== "undefined"){
            token = token.slice(7, token.length);
            return jwt.verify(token, secret, (err, data)=>{
                if(err){
                    return null;
                }
                else{
                    // the "decode" method is used to obtain info from the JWT
                    // jwt.decode(token,[options])
                    // Returns an object with access to the "payload" property which contains user info stored when token was generated
                    return jwt.decode(token,{complete:true}).payload;
                }
            })
        }
        // Token does not exist (undefined)
        else{
            return  null
        }
    }
