import * as Helper from "../helpers/helper.js";
import User from "../models/authModel.js";
import { isAdmin } from "../helpers/ownership.js";

export const Authenticated = async (req, res, next) => {
  try {
    const authToken = req.headers["authorization"];
    const token = authToken?.split(" ")[1];
    if (!token) {
      return res.status(401).send({ msg: "Unauthorized" });
    }

    const result = Helper.ExtractToken(token);
    if (!result) {
      return res.status(401).send({ msg: "Invalid token" });
    }

    const userId = result.id;
    if (!userId) {
      return res.status(401).send({ msg: "User ID not found in token" });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(401).send({ msg: "User not found" });
    }

    req.user = user;
    res.locals.userEmail = result.email;
    res.locals.roleId = result.roleId;

    next();
  } catch (error) {
    console.error("Error in Authenticated middleware:", error);
    return res.status(500).send({ msg: "Internal server error" });
  }
};


export const SuperUser = (req, res, next) => {
  try {
    const roleId = res.locals.roleId;
    if (roleId !== 6) {
      return res.status(401).send({ msg: "Forbidden" });
    }

    next();
  } catch (err) {
    console.error("authorizationPermission.js failed on " + req.method + " " + req.originalUrl + ":", err);
    return res.status(500).send({ msg: "Error" });
  }
};

export const AdminRole = (req, res, next) => {
  try {
    const roleId = res.locals.roleId;

    if (!isAdmin({ roleId })) {
      return res.status(403).send({ msg: "Forbidden - Admin role required" });
    }
    next();
  } catch (err) {
    console.error("AdminRole Middleware Error:", err);
    return res.status(500).send({ msg: "Error processing AdminRole middleware" });
  }
};

export const AgentRole = (req, res, next) => {
  try {
    const roleId = res.locals.roleId;

    if (roleId !== 2) { // Ensure `5` is the correct roleId for an admin.
      return res.status(403).send({ msg: "Forbidden - Admin role required" });
    }
    next();
  } catch (err) {
    console.error("AdminRole Middleware Error:", err);
    return res.status(500).send({ msg: "Error processing AdminRole middleware" });
  }
};



export const LandlordRole = (req, res, next) => {
  try {
    const roleId = res.locals.roleId;

    if (roleId !== 3) { // Ensure `5` is the correct roleId for an admin.
      return res.status(403).send({ msg: "Forbidden - Admin role required" });
    }
    next();
  } catch (err) {
    console.error("AdminRole Middleware Error:", err);
    return res.status(500).send({ msg: "Error processing AdminRole middleware" });
  }
};


export const SalesRole = (req, res, next) => {
  try {
    const roleId = res.locals.roleId;

    if (roleId !== 4) {
      return res.status(403).send({ msg: "Forbidden - Admin role required" });
    }
    next();
  } catch (err) {
    console.error("AdminRole Middleware Error:", err);
    return res.status(500).send({ msg: "Error processing AdminRole middleware" });
  }
};

export const BasicUser = (req, res, next) => {
  try {
    const roleId = res.locals.roleId;
    if (roleId !== 1) {
      return res.status(401).send({ msg: "Forbidden" });
    }

    next();
  } catch (err) {
    console.error("authorizationPermission.js failed on " + req.method + " " + req.originalUrl + ":", err);
    return res.status(500).send({ msg: "Error" });
  }
};

export const detectDevice = (req, res, next) => {
  const userAgent = req.headers['user-agent'] || '';
  
  const isMobile = /mobile|android|iphone|ipad|ipod|windows phone|blackberry|iemobile|opera mini|webos|bb10|playbook|tablet|kindle|silk/i.test(userAgent);
  
  req.deviceType = isMobile ? 'mobile' : 'web';
  
  next();
};
