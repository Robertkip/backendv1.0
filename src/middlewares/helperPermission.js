import RolePermissions from "../models/rolepermission.js";
import Permissions from "../models/permission.js";

class Helper {
    constructor() {}
    checkPermission(roleId, permName){
        return new Promise(
            (resolve, reject) => {
                Permissions.findOne({
                    where: {
                        perm_name: permName
                    }
                }).then((perm) => {
                    RolePermissions.findOne({
                        where: {
                            role_id: roleId,
                            perm_id: perm.id
                        }
                    }).then((rolePermission) => {
                        if(rolePermission) {
                            resolve(rolePermission);
                        } else {
                            reject({message: 'Forbidden'});
                        }
                    }).catch((error) => {
                        reject(error);
                    });
                }).catch(() => {
                    reject({message: 'Forbidden'});
                });
            }
        );
    }
}

export default Helper;
