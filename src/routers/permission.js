import express from 'express';
import passport from 'passport';
import Permissions from '../models/permission.js';
import Helper from '../middlewares/helperPermission.js';
import '../config/passport.js';(passport);
const router = express.Router();
const helper =new Helper();

router.post('/permission', passport.authenticate('jwt', {
    session: false
}),  function (req, res) {
    helper.checkPermission(req.user.role_id, 'permissions_add').then((rolePerm) => {
        if (!req.body.perm_name || !req.body.perm_description) {
            res.status(400).send({
                msg: 'Please pass permission name or description.'
            })
        } else {
            Permissions
                .create({
                    perm_name: req.body.perm_name,
                    perm_description: req.body.perm_description
                })
                .then((perm) => res.status(201).send(perm))
                .catch((error) => {
                    console.log(error);
                    res.status(400).send(error);
                });
        }
    }).catch((error) => {
        res.status(403).send(error);
    });
})

// Get List of permissions
router.get('/permission', passport.authenticate('jwt', {
    session: false
}), function (req, res) {
    helper.checkPermission(req.user.role_id, 'permissions_get_all').then((rolePerm) => {
        Permissions
            .findAll()
            .then((perms) => res.status(200).send(perms))
            .catch((error) => {
                res.status(400).send(error);
            });
    }).catch((error) => {
        res.status(403).send(error);
    });
});

export default router;
