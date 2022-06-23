/* 
 * Copyright (c) 2018 Carlos Cielo.
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v1.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-v10.html
 *
 * Contributors:
 *    Carlos Cielo - initial API and implementation and/or initial documentation
 */

var models = require('express-cassandra');

var logger = require('../logger/logger.js');


var ExpressCassandra = require('express-cassandra');
var models = ExpressCassandra.createClient({
    clientOptions: {
        contactPoints: ['127.0.0.1'],
        protocolOptions: {port: 9042},
        keyspace: 'rotwtest',
        queryOptions: {consistency: ExpressCassandra.consistencies.one}
    },
    ormOptions: {
        defaultReplicationStrategy: {
            class: 'SimpleStrategy',
            replication_factor: 1
        },
        migration: 'safe'
    }
});




var Visita = models.loadSchema('visitas_log', {
    fields: {
        id_visita: {
            type: "uuid",
            default: {"$db_function": "uuid()"}
        },
        ip_from: {type: "text", default: ''},
        user_agent: {type: "text", default: ''},
        country: {type: "text", default: ''},
        city: {type: "text", default: ''},
        destino: {
            type: "frozen",
            typeDef: '<tuple<text, text, text>>'
        },
        tema: {
            type: "frozen",
            typeDef: '<tuple<text, int>>'
        },
        id_usuario: {type: "int", default: 0},
        fecha: {
            type: "timestamp",
            default: {"$db_function": "toTimestamp(now())"}
        }
    },
    key: ["id_visita"]
});

var Dispositivo = models.loadSchema('dispositivos', {
    fields: {
        id_session: {
            type: "uuid",
            default: {"$db_function": "uuid()"}
        },
        id_user: {type: "int", default: 0},
        devices: {
            type: "list",
            typeDef: '<text>'
        },
        fecha_creacion: {
            type: "timestamp",
            default: {"$db_function": "toTimestamp(now())"}
        },
        fecha_actualizacion: {
            type: "timestamp",
            default: {"$db_function": "toTimestamp(now())"}
        }
    },
    key: ["id_session"]
});





exports.registerVisit = function (req, res) {

    console.log("REG VISITA");



    var ipFrom = req.headers['x-forwarded-for'] || req.headers['X-forwarded-for'] ||
            req.connection.remoteAddress ||
            req.socket.remoteAddress ||
            (req.connection.socket ? req.connection.socket.remoteAddress : null);

    var userAgent = req.get('User-Agent');


    var dominio = req.headers.host;
    var url = req.body.paramUrl;
    var protocoloArray = req.headers.origin.split(':');
    var protocolo = protocoloArray[0];

    var subject = req.body.subject;
    var idSubject = req.body.idSubject;
    var idUsuario = req.body.idUsuario;


    const iplocation = require("iplocation").default;

    var ipFromTrim = ipFrom.replace('::ffff:', '');

    iplocation(ipFromTrim)
            .then((res) => {

                console.dir(res);
                saveVisit(res.countryCode, res.region);
            })
            .catch(err => {
                console.dir(err);
                saveVisit('', '');
            });

    function saveVisit(countryFrom, cityFrom) {

        var visitaCass = new models.instance.visitas_log({
            ip_from: ipFromTrim,
            user_agent: userAgent,
            country: countryFrom,
            city: cityFrom,
            destino: new models.datatypes.Tuple(dominio, url, protocolo),
            tema: new models.datatypes.Tuple(subject, idSubject),
            id_usuario: idUsuario,
            fecha: Date.now()
        });


        visitaCass.save(function (err) {
            if (err) {
                console.log(err);
                res.send(err);
                
                logger.error("_CASS "+err.toString());
                return;
            }
            console.log('CASS Registra entrada!');
            res.json(1);
        });
    }

//ALSO findOne
//    models.instance.visitas_log.find({id_usuario: 45}, {allow_filtering: true}, function (err, john) {
//        if (err) {
//            console.log(err);
//            return;
//        }
//        //Note that returned variable john here is an instance of your model,
//        //so you can also do john.delete(), john.save() type operations on the instance.
//        console.log('john: ' + john);
//
//    });





    /*
     UPDATE person
     USING TTL 86400
     SET email='abc@gmail.com'
     WHERE username= 'abc'
     IF EXISTS
     */



////The row will be removed after 86400 seconds or one day
//john.save({ttl: 86400}, function(err){
//    if(err) console.log(err);
//    else console.log('Yuppiie!');
//});
//var query_object = {username: 'abc'};
//var update_values_object = {email: 'abc@gmail.com'};
//var options = {ttl: 86400, if_exists: true};
//models.instance.Person.update(query_object, update_values_object, options, function(err){
//    if(err) console.log(err);
//    else console.log('Yuppiie!');
//});





};



exports.registerDevice = function (req, res) {

    console.log("REG Device");

    //var idUsuario = req.body.idUsuario;
    var idUsuario = req.body.idUser;
    var devices = [req.body.f_token];

    saveSession();

    function saveSession() {

        var dispositivoCass = new models.instance.dispositivos({
            id_user: idUsuario,
            devices: devices,
            fecha_actualizacion: Date.now(),
            fecha_creacion: Date.now()
        });

        ////The row will be removed after 86400 seconds or one day
        dispositivoCass.save({ttl: 86400}, function (err) {
            if (err) {
                console.log(err);
                res.send(err);
                logger.error("_CASS "+err.toString());
                return;
            }
            console.log('CASS Registra session!');
            res.json(1);
        });
    }










};


exports.getDevicesByUser = function (req, res) {

    //req.body.idUser
    models.instance.dispositivos.findOne({id_user:  Number.parseInt(req.params.idUser)}, {allow_filtering: true}, function (err, device) {
        if (err) {
            console.log(err);
            return;
        }
        //Note that returned variable john here is an instance of your model,
        //so you can also do john.delete(), john.save() type operations on the instance.
       
     
       res.json(device);

    });

};


exports.addDevice = function (req, res) {
    
    var id_session = models.uuidFromString(req.body.idSession);
   
    var query_object = {id_session: id_session};
  
    
    
    models.instance.dispositivos.findOne(query_object, function(err, dispositivo){
        
        dispositivo.devices.push(req.body.f_token);
        dispositivo.fecha_actualizacion= new Date();
        
       
        dispositivo.save(function(err){
            
        if (err) {
            console.log(err);
            logger.error("_CASS "+err.toString());
            return;
        }
        console.log("ID SESSION "+dispositivo.id_session);
            

        });
    });



};

//models.instance.Person.update({userID:1234, age:32}, {
//    info:{'$remove':{'new2':''}},
//    phones:{'$remove': ['12345']},
//    emails: {'$remove': ['e@f.com']}
//}, function(err){
//    if(err) throw err;
//    done();
//});