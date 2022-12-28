import express from 'express';
import passport from 'passport';
import User from '../models/authModel.js';
import Roles from '../models/role.js';
import Permissions from '../models/permission.js';
import Helper from '../middlewares/helperPermission.js';
import RolePermissions from '../models/rolepermission.js';
import {passportJwt} from "../config/passport.js";

passportJwt(passport);
const router = express.Router();
const helper = new Helper();

// Create a new Role
router.post('/roles', function (req, res) {
    helper.checkPermission().then((rolePerm) => {
        if (!req.body.role_name || !req.body.role_description) {
            res.status(400).send({
                msg: 'Please pass Role name or description.'
            })
        } else {
            Roles
                .create({
                    role_name: req.body.role_name,
                    role_description: req.body.role_description
                })
                .then((role) => res.status(201).send(role))
                .catch((error) => {
                    res.status(400).send({
                        success: false,
                        msg: error
                    });
                });
        }
    }).catch((error) => {
        res.status(403).send({
            success: false,
            msg: error
        });
    });
});

// Get List of Roles
router.get('/roles', passport.authenticate('jwt', {
    session: false
}), function (req, res) {
    helper.checkPermission(req.user.role_id, 'role_get_all').then((rolePerm) => {
        console.log(rolePerm);
        Roles
            .findAll({
                include: [{
                        model: Permissions,
                        as: 'permissions',
                    },
                    {
                        model: User,
                        as: 'users',
                    }
                ]
            })
            .then((roles) => res.status(200).send(roles))
            .catch((error) => {
                res.status(400).send({
                    success: false,
                    msg: error
                });
            });
    }).catch((error) => {
        res.status(403).send({
            success: false,
            msg: error
        });
    });
});

export default router;