var express = require('express'),
    app = express(),
    nodemailer = require('nodemailer'),
    bodyParser = require('body-parser'),
    encryption = require('./../encryption/'),
    srv_config = require('./../srv_config.json'),
    mail = require('./mail/'),
    telegram = require('./telegram/'),
    // push = require('./push/'),
    mysql = require('mysql'),
    db = require('./../db/').getPool();

/**
 * notification send handler
 * @param  {ServerRequest} req  server request
 * @param  {ServerResponse} res server response
 */
exports.send = function(req, res) {
    res.contentType('application/json');
	res.setHeader('Access-Control-Allow-Origin', '*');

    // check required params
    if(typeof req.body !== 'undefined' && req.body.akey && req.body.token) {
        // validate token
        var sql = mysql.format('SELECT accounts.akey, email, push, telegram, lng, accounts.token FROM settings \
            INNER JOIN accounts ON accounts.akey=settings.akey INNER JOIN stats ON accounts.akey=stats.akey WHERE accounts.akey=?', [req.body.akey]);

        // check if specified account exists
        db.query(sql, function(err, queryRes) {
            if(!err && queryRes && queryRes[0]) {
                if(queryRes[0].token === req.body.token) {
                    // send notifications in background depending on type
                    if(queryRes[0].email) mail.sendMail(queryRes[0].email, queryRes[0].lng, req.body.error);
                    // if(queryRes[0].push) push.sendPush(req.body.akey, queryRes[0].lng, req.body.error);
                    if(queryRes[0].telegram) telegram.sendMessage(queryRes[0].telegram, queryRes[0].lng, req.body.error);
                    // let the notifications proceed in background, inform user
                    res.json({message: 'Notifications successfully sent'});
                } else res.status(401).json({message: 'Unauthorized', error: 401});
            } else res.status(401).json({message: 'Unauthorized', error: 401});
        });
    } else res.status(422).json({message: 'Missing parameters. Unable to handle request', error: 422});
};
