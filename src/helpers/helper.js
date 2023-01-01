import jwt from "jsonwebtoken";
import dotenv from 'dotenv';

dotenv.config();

let userData = {
    username,
    email,
    roleId,
    verified,
    active,
};

export const ResponseData = (status, data, message) =>  {
   let res = {
    status,
    message,
    data: data
   };
   return res;
} 

export const GenerateToken = (data) => {
    const token = jwt.sign(data, process.env.JWT_TOKEN, {expiresIn: "20s"});

    return token
}

export const GenerateRefreshToken = (data) => {
    const token = jwt.sign(data, process.env.JWT_REFRESH_TOKEN, {expiresIn: "1d"});

    return token
}

export const ExtractToken = (token) => {
    const secretKey = process.env.JWT_TOKEN;
    let resData;
    const res = jwt.verify(token, secretKey, (err, decoded) => {
        if(err){
            resData = null;
        } else {
            resData = decoded
        }
    });

    if(resData) {
        const result = userData(resData);
        return result;
    }
    return null;
}

export const ExtractRefreshToken = (token) => {
    const secretKey = process.env.JWT_REFRESH_TOKEN;
    let resData;
    const res = jwt.verify(token, secretKey, (err, decoded) => {
        if(err){
            resData = null;
        } else {
            resData = decoded
        }
    });

    if(resData) {
        const result = userData(resData);
        return result;
    }
    return null;
}
