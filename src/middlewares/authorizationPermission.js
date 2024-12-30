import * as Helper from "../helpers/helper.js";
import User from "../models/authModel.js";

export const Authenticated = async (req, res, next) => {
  try {
    const authToken = req.headers["authorization"];
    if (!authToken) {
      console.log("No authorization header provided.");
      return res.status(401).send({ msg: "Unauthorized" });
    }

    const token = authToken.split(" ")[1];
    if (!token) {
      console.log("No token found in authorization header.");
      return res.status(401).send({ msg: "Unauthorized" });
    }

    const result = Helper.ExtractToken(token);
    if (!result) {
      console.log("Token verification failed.");
      return res.status(401).send({ msg: "Invalid token" });
    }

    console.log("Decoded Token Result:", result);

    const userId = result.id;
    if (!userId) {
      console.log("User ID missing in token.");
      return res.status(401).send({ msg: "User ID not found in token" });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      console.log("User not found in database for ID:", userId);
      return res.status(401).send({ msg: "User not found" });
    }

    req.user = user;
    res.locals.userEmail = result.email;
    res.locals.roleId = result.roleId;

    console.log("Authenticated User Email:", result.email);
    console.log("Authenticated Role ID:", result.roleId);

    next();
  } catch (error) {
    console.error("Error in Authenticated middleware:", error);
    return res.status(500).send({ msg: "Internal server error" });
  }
};


// export const Authenticated = async (req, res, next) => {
//   try {
//     const authToken = req.headers["authorization"];
//     const token = authToken && authToken.split(" ")[1];
//     if (token === null) {
//       return res.status(401).send({ msg: "Unauthorized" });
//     }
//     const result = Helper.ExtractToken(token);
//     console.log("Authenticated result is", result.id);

//     if (!result) {
//       return res.status(401).send({ msg: "Unauthorized" });
//     }

//     const userId = result.id;
//     const user = await User.findByPk(userId);

//     console.log("Single User", user);

//     req.user = user;

//     res.locals.userEmail = result?.email;
//     res.locals.roleId = result?.roleId;
//     console.log("The locally obtained roleId Is", roleId);
//     next();
//   } catch (error) {
//     console.log(error);
//   }
// };

export const SuperUser = (req, res, next) => {
  try {
    const roleId = res.locals.roleId;
    console.log(roleId);
    if (roleId !== 6) {
      return res.status(401).send({ msg: "Forbidden" });
    }

    next();
  } catch (err) {
    return res.status(500).send({ msg: "Error" });
  }
};

export const AdminRole = (req, res, next) => {
  try {
    const roleId = res.locals.roleId;
    console.log("AdminRole Middleware - roleId:", roleId);

    if (roleId !== 5) { // Ensure `5` is the correct roleId for an admin.
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
    return res.status(500).send({ msg: "Error" });
  }
};
