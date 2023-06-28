import * as Helper from "../helpers/helper.js";
import User from "../models/authModel.js";

export const Authenticated = (req, res, next) => {
  try {
    const authToken = req.headers["authorization"];
    const token = authToken && authToken.split(" ")[1];
    if (token === null) {
      return res.status(401).send({ msg: "Unauthorized" });
    }
    const result = Helper.ExtractToken(token);
    console.log("Authenticated result is", result.id);

    const userId = result.id;
    const user = User.findByPk(userId);

    // req.user = user;

    console.log("User Object is", user);

    if (!result) {
      return res.status(401).send({ msg: "Unauthorized" });
    }

    // res.locals.userEmail = result?.email;
    // res.locals.roleId = result?.roleId;
    // console.log("The locally obtained roleId Is", roleId);
    next();
  } catch (error) {
    console.log(error);
  }
};

export const SuperUser = (req, res, next) => {
  try {
    const roleId = res.locals.roleId;
    console.log(roleId);
    if (roleId !== 1) {
      return res.status(401).send({ msg: "Forbidden" });
    }

    next();
  } catch (err) {
    return res.status(500).send({ msg: "Error" });
  }
};

export const AdminRole = (req, res, next) => {
  try {
    const authToken = req.headers["authorization"];
    const token = authToken && authToken.split(" ")[1];
    const result = Helper.ExtractToken(token);
    const roleId = result.roleId;
    console.log("The role is for admin is", roleId);
    if (roleId !== 2) {
      return res.status(401).send({ msg: "Forbidden" });
    }
    next();
  } catch (err) {
    return res.status(500).send({ msg: "Error" });
  }
};

export const BasicUser = (req, res, next) => {
  try {
    const roleId = res.locals.roleId;
    if (roleId !== 3) {
      return res.status(401).send({ msg: "Forbidden" });
    }

    next();
  } catch (err) {
    return res.status(500).send({ msg: "Error" });
  }
};
