import {log} from '../../../service/log'
import {user as userSchema} from '../schema'
import {Collection as Mongo} from "../../../db/mongo/mongo"
let userModel = new Mongo("user", userSchema)['collection']

const controller = {
    signIn: signIn,
};

class user {

}

function signIn(req, res, next) {
    return new Promise((resolve, reject) => {
        log.debug(req.body, 'auth', 1)
        userModel.findOne({'email.address': req.body.username}, (error, data) => {
            log.debug(data, 'auth', 1)
            if (data.email.confirmed === true) {
                req.session.save(function (err) {
                    if (err) {
                        return next(err);
                    }
                    res.cookie('user', req.user.email.address);
                    res.send({
                        error: false,
                        emailConfirmed: true
                    });
                });
            } else {
                log.debug('email is not confirmed', 'auth', 1);
                res.send({error: false, emailConfirmed: false});
            }
        });
    })

}

export {controller}
