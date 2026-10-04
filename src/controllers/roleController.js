import Role from "../models/role.js";

export const GetRole = async (req, res) => {
    try {
        const roles = await Role.findAll({
         where: {
            active: true
         }
        });
        return res.status(200).send({
           status: 200,
           message: 'OK',
           data: roles 
        })
    } catch (error) {
        console.error("roleController.js failed on " + req.method + " " + req.originalUrl + ":", error);
        return res.status(500).send({
			status: 500,
			message: "Internal server error",
		});
    }
}

export const CreateRole = async (req, res) => {
	try {
		const { roleName, active } = req.body;
		if (!roleName) {
			return res.status(400).send({ status: 400, message: "roleName is required", data: null });
		}

		const create = await Role.create({
			roleName,
			active
		});

		return res.status(201).send({
			status: 201,
			message: "Created",
			data: create
		});
	} catch (error) {
		console.error("roleController.js failed on " + req.method + " " + req.originalUrl + ":", error);
		return res.status(500).send({
			status: 500,
			message: "Internal server error",
		});
	}
}

export const UpdateRole = async (req, res) => {
	try {
		const { id } = req.params;
		const { roleName, active } = req.body;

		const role = await Role.findByPk(id);

		if (!role) {
			return res.status(404).send({
				status: 404,
				message: "Data Not Found",
				data: null
			});
		}

		role.roleName = roleName;
		role.active = active;

		await role.save();

		return res.status(200).send({
			status: 200,
			message: "OK",
			data: role
		});
	} catch (error) {
		console.error("roleController.js failed on " + req.method + " " + req.originalUrl + ":", error);
		return res.status(500).send({
			status: 500,
			message: "Internal server error",
		});
	}
};

export const DeleteRole = async (req, res) => {
	try {
		const { id } = req.params;

		const role = await Role.findByPk(id);

		if (!role) {
			return res.status(404).send({
				status: 404,
				message: "Data Not Found",
				data: null
			});
		}

		await role.destroy();

		return res.status(200).send({
			status: 200,
			message: "Deleted",
			data: null
		});
	} catch (error) {
		console.error("roleController.js failed on " + req.method + " " + req.originalUrl + ":", error);
		return res.status(500).send({
			status: 500,
			message: "Internal server error",
		});
	}
}

export const GetRoleById = async (req, res) => {
	try {
		const { id } = req.params;

		const role = await Role.findByPk(id);

		if (!role) {
			return res.status(404).send({
				status: 404,
				message: "Data Not Found",
				data: null
			});
		}

		return res.status(200).send({
			status: 200,
			message: "OK",
			data: role
		});
	} catch (error) {
		console.error("roleController.js failed on " + req.method + " " + req.originalUrl + ":", error);

		return res.status(500).send({
			status: 500,
			message: "Internal server error",
	
		});
	}
}

