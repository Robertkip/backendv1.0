import * as Helper from "../helpers/helper.js";

export const Authenticated = (req, res, next) => {
    try {
        const authToken = req.headers["authorization"];
        const token = authToken && authToken.split(" ")[1];
        if (token === null) {
			return res.status(401).send({msg: "Unauthorized"});
		}
		const result = Helper.ExtractToken(token);
		if (!result) {
			return res.status(401).send({msg: "Unauthorized"});
		}

		res.locals.userEmail = result.email;
		res.locals.roleId = result.roleId;
		console.log(roleId);
		next();
    } catch (error) {
        
    }
}

export const SuperUser = (req, res, next) => {
	try {
		const roleId = res.locals.roleId;
		console.log(roleId);
		if (roleId !== 2) {
			return res.status(401).send({msg: "Forbidden"});
		}

		next();
	} catch (err) {
		return res.status(500).send({msg: "Error"});
	}
};

export const AdminRole = (req, res, next) => {
	try {
		const roleId = res.locals.roleId;
		console.log(roleId);
		if (roleId !== 3) {
			return res.status(401).send({msg: "Forbidden"});
		}

		next();
	} catch (err) {
		return res.status(500).send({msg: "Error"});
	}
};

export const BasicUser = (req, res, next) => {
	try {
		const roleId = res.locals.roleId;
		if (roleId !== 4) {
			return res.status(401).send({msg: "Forbidden"});
		}

		next();
	} catch (err) {
		return res.status(500).send({msg: "Error"});
	}
};
