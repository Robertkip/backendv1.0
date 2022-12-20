import Roles from "../models/roleModel";
import Permission from "../models/permissionModel";

export default (permission) => (req, res, next) => async(req, res) => {
    const access = await Permission.findOne({
        where: { name: permission },
        include: [{ attributes: ['id', 'name'], model: Role, as: 'roles', through: { attributes: [] } }],
    })
    if (await req.userData.hasPermissionTo(access)) {
        return next();
    }
}

console.error('You do not have the authorization to access this.');
