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

var House = require('./modelo/House');
var User = require('./modelo/User');
var Conversation = require('./modelo/Conversation');
var Charge = require('./modelo/Charge');

var logger = require('./logger/logger.js');

// Guarda un objeto House en base de datos
exports.setHouse = function (req, res) {

    // Creo el objeto House
    House.create(
            {id_house: req.body.idHouse,
                available: true,
                images: req.body.images,
                services: req.body.services,
                features: req.body.features,
                characteristics: req.body.characteristics,
                rooms: req.body.rooms,
                age_rate: req.body.ageRate,
                is_roomie: req.body.isRoomie,
                no_baths: req.body.noBan,
                no_rooms: req.body.noRec,
                min_months: req.body.min_months,
                requirements: req.body.requirements
            },
            function (err, house) {
                if (err) {
                    res.send(err);
                    logger.error("_MONGO " + err.toString());
                }
                res.json(house);

                // Obtine y devuelve todas las casas tras crear una de ellas
//                House.find(function (err, house) {
//                    if (err)
//                        res.send(err);
//                    res.json(house);
//                });
            });

};




exports.addLiving = function (req, res) {

    var objLiving = new Object();
    objLiving.id_living = req.body.idLiv;
    if (req.body.idCuarto !== undefined || req.body.idCuarto !== null) {
        objLiving.id_room = req.body.idCuarto;
    }
    objLiving.price = req.body.price;
    console.log("recibo id_living: " + objLiving.id_living);
    House.update(
            {id_house: req.params.id_house},
            {$push: {living: objLiving}},
            function (err, house) {
                if (err) {
                    res.send(err);
                    logger.error("_MONGO " + err.toString());
                }

                res.json(house);
                //Obtine y devuelve todas las casas tras crear una de ellas
//                House.find(function (err, house) {
//                    console.log("ENTRO A CONSULTAR LIVING");
//                    if (err)
//                        res.send(err);
//                    res.json(house);
//                });


            }
    );

};


exports.mudarRoomie = function (req, res) {


    var objLiving = new Object();
    objLiving.id_living = req.body.idLiv;
    objLiving.price = req.body.price;
    objLiving.status = 1;
    objLiving.start_at = req.body.start_at;
    objLiving.months = req.body.months;
    objLiving.id_contract = req.body.id_contract;



    if (req.body.idCuarto !== undefined || req.body.idCuarto !== null) {
        objLiving.id_room = req.body.idCuarto;
    }
    var objAspirant = new Object();
    objAspirant.id_aspirant = req.body.idLiv;


    House.update(
            {id_house: req.params.id_house},
            {$push: {living: objLiving},
                $pull: {aspirants: objAspirant}},
            function (err, house) {
                if (err) {
                    res.send(err);
                    logger.error("_MONGO " + err.toString());
                }

                res.json(house);
            }
    );

};


exports.deliverKLiving = function (req, res) {

    House.update({'living._id': req.params.id_app},
            {$set: {'living.$.status': 2}},
            function (err, house) {
                if (err) {
                    res.send(err);
                    logger.error("_MONGO " + err.toString());
                }
                res.json(1);

            }
    );

};

exports.moveToExtenant = function (req, res) {

    var query = House.findOne({'living.id_living': req.body.id_living});

    var objLiving = new Object();
    objLiving.id_living = req.body.id_living;

    var objExtenant = new Object();

    query.exec(function (err, house) {
        if (err) {

            logger.error("_MONGO " + err.toString());

            return handleError(err);
        }
        for (var i; i < house.living.length; i++) {

            if (house.living[i].id_living === req.body.id_living) {

                objExtenant.id_extenant = house.living[i].id_living;
                objExtenant.id_contract = house.living[i].id_contract;
                objExtenant.price = house.living[i].price;
                objExtenant.status = 1;
                objExtenant.start_at = house.living[i].start_at;
                objExtenant.months = house.living[i].months;

                if (house.living[i].id_room !== undefined || house.living[i].id_room !== null) {
                    objExtenant.id_room = house.living[i].id_room;
                }
                break;
            }

        }

        House.update(
                {id_house: req.params.id_house},
                {$push: {extenant: objExtenant},
                    $pull: {living: objLiving}},
                function (err, house) {
                    if (err) {
                        res.send(err);
                        logger.error("_MONGO " + err.toString());
                    }

                    res.json(1);
                }
        );

    });



};


exports.addAspirant = function (req, res) {

    var objAspirant = new Object();
    objAspirant.id_aspirant = req.body.idAsp;
    objAspirant.id_room = req.body.idCuarto;
    objAspirant.price = req.body.price;
    objAspirant.status = 1;
    objAspirant.start_at = req.body.startAt;
    objAspirant.months = req.body.months;


    House.update(
            {id_house: req.params.id_house},
            {$push: {aspirants: objAspirant}},
            function (err, house) {
                if (err) {
                    res.send(err);
                    logger.error("_MONGO " + err.toString());
                }

                res.json(house);
                //Obtine y devuelve todas las casas tras crear una de ellas
//                House.find(function (err, house) {
//                    console.log("ENTRO A CONSULTAR");
//                    if (err)
//                        res.send(err);
//                    res.json(house);
//                });
            }
    );

};




exports.acceptAspirant = function (req, res) {

    //(48*60*60*1000)
    var ahora = new Date();
    var expireDate = new Date();
    expireDate.setTime(ahora.getTime() + (48 * 60 * 60 * 1000));

    console.log("EXPIRA: ");
    console.log(expireDate);

    House.update({'aspirants._id': req.params.id_app},
            {$set: {'aspirants.$.status': 2, 'aspirants.$.updated_at': expireDate}},
            function (err, house) {
                if (err) {
                    res.send(err);
                    logger.error("_MONGO " + err.toString());
                }

                res.json(house);

//                House.find(function (err, house) {
//                    console.log("ENTRO A CONSULTAR");
//                    if (err)
//                        res.send(err);
//                    res.json(house);
//                });
            }
    );

};

exports.addRate = function (req, res) {

    var objLiving = new Object;
    objLiving.id_living = req.body.appli.id_living;

    var objExtenant = req.body.appli;
    objExtenant.id_extenant = req.body.appli.id_living;
    objExtenant.status = 1;


    House.update(
            {id_house: req.params.id_house},
            {$push: {rates: req.body, extenant: objExtenant},
                $pull: {living: objLiving}},
            function (err, house) {
                if (err) {
                    res.send(err);
                    logger.error("_MONGO " + err.toString());
                }
                res.json(house);

            }
    );

};


exports.addRateRoomie = function (req, res) {
    User.update(
            {id_user: req.params.id_user},
            {$push: {rates: req.body}},
            function (err, user) {
                if (err) {
                    res.send(err);
                    logger.error("_MONGO " + err.toString());
                }


                House.update({'extenant._id': req.body.id_app},
                        {$set: {'extenant.$.status': 2}},
                        function (err, house) {
                            if (err)
                                res.send(err);

                            res.json(1);

                        }
                );

            }
    );

};

exports.updateCaracHouse = function (req, res) {

    House.update(
            {id_house: req.params.id_house},
            {services: req.body.services,
                features: req.body.features,
                characteristics: req.body.characteristics},
            function (err, house) {
                if (err)
                    res.send(err);

                res.json(house);
                //Obtine y devuelve todas las casas tras crear una de ellas
//                House.find(function (err, house) {
//                    console.log("AFTER UPDATE CARAC:  ");
//                    if (err)
//                        res.send(err);
//                    res.json(house);
//                });


            }
    );

};

exports.updateImagesHouse = function (req, res) {

    House.update(
            {id_house: req.params.id_house},
            {images: req.body.images},
            function (err, house) {
                if (err)
                    res.send(err);

                res.json(house);
                //Obtine y devuelve todas las casas tras crear una de ellas
//                House.find(function (err, house) {
//                    console.log("AFTER UPDATE Images:  ");
//                    if (err)
//                        res.send(err);
//                    res.json(house);
//                });


            }
    );

};

exports.getHousesById = function (req, res) {

    var query = House.findOne({'id_house': req.params.id_house});

    // selecting the `name` and `occupation` fields
    //query.select('name occupation');

    // execute the query at a later time
    query.exec(function (err, house) {
        if (err)
            return handleError(err);
        console.log("HOUSE  " + house);
        res.json(house);
    });
};


exports.getHousesByStr = function (req, res) {

    var idHouseArray = req.params.id_house_str.split('-');


    var query = House.find({
        'id_house': {$in: idHouseArray}
    });

    query.exec(function (err, house) {
        if (err)
            return handleError(err);
        res.json(house);
    });
};


exports.getAllHouses = function (req, res) {

    var query = House.find({'available': true});

    // selecting the `name` and `occupation` fields
    //query.select('name occupation');

    // execute the query at a later time
    query.exec(function (err, house) {
        if (err)
            return handleError(err);
        res.json(house);
    });
};


exports.getMyHouse = function (req, res) {

    var query = House.findOne({'living.id_living': req.params.id_living});

    // selecting the `name` and `occupation` fields
    //query.select('name occupation');

    // execute the query at a later time
    query.exec(function (err, house) {
        if (err)
            return handleError(err);
        console.log("HOUSE OF MINE" + house);
        res.json(house);
    });
};



exports.addRoom = function (req, res) {

    House.update(
            {id_house: req.params.id_house},
            {$push: {rooms: req.body}},
            function (err, house) {
                if (err)
                    res.send(err);
                res.json(house);
                //Obtine y devuelve todas las casas tras crear una de ellas

            }
    );

};

exports.removeAspirant = function (req, res) {

    var objAspirant = new Object();
    objAspirant.id_aspirant = req.body.idAsp;
    //var queryAspirantesExistentes= House.find( { 'aspirants.id_aspirant': req.body.idAsp }  );

    House.update(
            {id_house: req.params.id_house},
            {$pull: {aspirants: objAspirant}},
            function (err, house) {
                if (err)
                    res.send(err);

                res.json(house);
                // Obtine y devuelve todas las casas tras crear una de ellas
//                House.find(function (err, house) {
//                    if (err)
//                        res.send(err);
//                    res.json(house);
//                });


            }
    );

};



exports.getApplicationsByUser = function (req, res) {

    var query = House.find({
        'aspirants.id_aspirant': req.params.id_aspirant
    });

    query.exec(function (err, house) {
        if (err)
            return handleError(err);
        console.log("Houses  " + house);
        res.json(house);
    });
};


exports.getRoomById = function (req, res) {

    var query = House.findOne({
        'rooms.id_room': req.params.id_room
    });

    query.exec(function (err, house) {
        if (err) {
            return handleError(err);
        } else {

            if (house !== null) {
                var objectHouse = house.toObject();
                if (objectHouse.rooms !== null) {
                    var room = getRoom(objectHouse.rooms, req.params.id_room);

                    res.json(room);
                }
            } else {
                res.json("");
            }
        }
    });
};

exports.updateFurniture = function (req, res) {

    House.update(
            {'rooms.id_room': req.params.id_room},
            {$set: {'rooms.$.furniture': req.body.furniture}},
            function (err, house) {
                if (err)
                    res.send(err);

                res.json(house);


            }
    );
};


exports.setUser = function (req, res) {

    // Creo el objeto House
    User.create(
            {
                id_user: req.body.idUser,
                username: req.body.username,
                budget_min: req.body.budget_min,
                budget_max: req.body.budget_max,
                characteristics: req.body.characteristics},
            function (err, user) {
                if (err)
                    res.send(err);

                // Obtine y devuelve todas las casas tras crear una de ellas
                User.find(function (err, user) {
                    if (err)
                        res.send(err);
                    res.json(user);
                });
            });

};


exports.updateUserCharac = function (req, res) {

    User.update(
            {id_user: req.params.idUser},
            {characteristics: req.body.characteristics},
            function (err, user) {
                if (err)
                    res.send(err);

                res.json(user);
                //Obtine y devuelve todas las casas tras crear una de ellas
//                User.find(function (err, user) {
//                    console.log("AFTER UPDATE User:  ");
//                    if (err)
//                        res.send(err);
//                    res.json(user);
//                });


            }
    );

};


exports.updateUserAddClient = function (req, res) {

    User.update(
            {id_user: req.params.idUser},
            {client: req.body.client},
            function (err, user) {
                if (err)
                    res.send(err);

                res.json(user);
            }
    );

};


exports.updateClientActive = function (req, res) {


    User.update(
            {'client._id': req.body._id},
            {'$set': {'client.activo': true}},
            function (err, user) {
                if (err)
                    res.send(err);

                res.json(user);
            }
    );




};



//DEpre
exports.getUserByUsername = function (req, res) {

    var query = User.findOne({'username': req.params.username});

    // selecting the `name` and `occupation` fields
    //query.select('name occupation');
    //db.inventory.find( { qty: { $in: [ 5, 15 ] } } )
    // { tags: { $in: ["appliances", "school"] } },
    // execute the query at a later time
    query.exec(function (err, user) {
        if (err)
            return handleError(err);
        console.log("USER  " + user);
        res.json(user);
    });
};


exports.getUserById = function (req, res) {

    var query = User.findOne({'id_user': req.params.idUser});

    query.exec(function (err, user) {
        if (err)
            return handleError(err);
        console.log("USER  " + user);
        res.json(user);
    });
};


exports.getUsersByUsernames = function (req, res) {

    var usernameArray = req.params.usernames.split('-');
    var query = User.find({
        'username': {$in: usernameArray}
    });

    // selecting the `name` and `occupation` fields
    //query.select('name occupation');
    //db.inventory.find( { qty: { $in: [ 5, 15 ] } } )
    // { tags: { $in: ["appliances", "school"] } },
    // execute the query at a later time
    //$or:[ {'id_participants':29}, {'id_participants':29}]
    query.exec(function (err, user) {
        if (err)
            return handleError(err);
        console.log("USERS  " + user);
        res.json(user);
    });
};


exports.getUsersByIds = function (req, res) {

    var idUsersArray = req.params.idUsers.split('-');


    var query = User.find({
        'id_user': {$in: idUsersArray}
    });

    query.exec(function (err, user) {
        if (err)
            return handleError(err);
        console.log("USERS  " + user);
        res.json(user);
    });
};

exports.setConversation = function (req, res) {

    // Creo el objeto Conversation
    Conversation.create(
            {id_participants: req.body.idParticipantes,
                messages: req.body.mensajes},
            function (err, conversation) {
                if (err)
                    res.send(err);

                res.json(conversation);
                // Obtine y devuelve todas las casas tras crear una de ellas
//                Conversation.find(function (err, conversation) {
//                    if (err)
//                        res.send(err);
//                    res.json(conversation);
//                });
            });

};

exports.addMessage = function (req, res) {

    Conversation.update(
            {_id: req.params.id_conversation},
            {$push: {messages: req.body.mensaje}},
            function (err, conversation) {
                if (err)
                    res.send(err);

                var query = Conversation.findOne({_id: req.params.id_conversation});
                //Obtine y devuelve  la conver tras actualizarla
                query.exec(function (err, conversation) {
                    console.log("ENTRO A CONSULTAR");
                    if (err)
                        res.send(err);
                    res.json(conversation);
                });
            }
    );

};

exports.getConversationsByIdUser = function (req, res) {

    var query = Conversation.find({
        id_participants: req.params.id_user
    });

    query.exec(function (err, conversation) {
        if (err)
            res.send(err);
        console.log("Conversations  " + conversation);
        res.json(conversation);
    });
};


exports.countUsers = function (req, res) {

    var query = User.count();
    query.exec(function (err, user) {
        if (err)
            return handleError(err);
        console.log("USERS  " + user);
        res.json(user);
    });
};

exports.countHouses = function (req, res) {

    var query = House.count();
    query.exec(function (err, house) {
        if (err)
            return handleError(err);
        console.log("Houses:  " + house);
        res.json(house);
    });
};

exports.countRooms = function (req, res) {

    var query = House.find();
    query.select('rooms');
    query.exec(function (err, house) {
        if (err)
            return handleError(err);
        //console.log("Rooms:  "+house); 
        res.json(house);
    });
};


//NOTIFICATIONS
exports.setNotification = function (req, res) {

    console.dir(req.params);
    console.dir(req.body);

    User.update(
            {id_user: req.params.idUser},
            {$push: {notifications: req.body}},
            function (err, user) {
                if (err)
                    res.send(err);

                var query = User.findOne({id_user: req.params.id_user});
                //Obtine y devuelve  la conver tras actualizarla
                query.exec(function (err, user) {
                    console.log("ENTRO A CONSULTAR");
                    if (err)
                        res.send(err);
                    res.json(user);
                });
            }
    );

};


exports.readNotification = function (req, res) {

    console.dir(req.body);

    User.update(
            {'notifications._id': req.body.idNotificacion},
            {'$set': {'notifications.$.seen': true}},
            function (err, user) {
                if (err)
                    res.send(err);

                var query = User.findOne({id_user: req.params.id_user});
                //Obtine y devuelve  la conver tras actualizarla
                query.exec(function (err, user) {
                    console.log("ENTRO A CONSULTAR");
                    if (err)
                        res.send(err);
                    res.json(true);
                });
            }
    );

};


exports.getNotificationsByUser = function (req, res) {

    var query = User.findOne({'id_user': req.params.idUser});

    query.exec(function (err, user) {
        if (err)
            return handleError(err);

        if (user !== null) {
            var notificaciones = user.notifications.filter(isSeen);
//        console.log("NOTIFICATIONS  " + user.notifications);
            res.json(notificaciones);
        } else {
            res.json(false);
        }



    });
};

exports.confirmPIN = function (req, res) {

    console.dir(req.body);

    var idauth = "";

    var query = User.findOne({
        id_user: req.params.id_user,
        'verification.pin': req.body.pin,
        'verification.type': "PH",
        'verification.valid_to': {$lt: Date.now()}
    });
    //status 1

    query.exec(function (err1, user1) {
        if (err1) {
            return handleError(err1);
        } else {


            var userStr = JSON.stringify(user1);


            if (userStr.indexOf("verification") !== -1) {

                var userJSON = JSON.parse(userStr);

                userJSON.verification.forEach(function (element) {
                    //element.valid_to.getTime() > Date.now().getTime()

                    if (element.pin === req.body.pin && element.type === "PH") {
                        idauth = element._id;
                    }
                });



                console.log("AUTH: " + idauth);
                if (idauth !== "") {
                    User.update(
                            {'verification._id': idauth}
                    ,
                            {'$set': {'verification.$.valido': true,
                                    'verification.$.status': 2}},
                            function (err, user) {
                                if (err) {
                                    res.send(err);
                                } else {

                                    res.json(user);


                                }


                            }
                    );
                }
            } else {
                
               res.status(500).send(user1);
            }
        }
    });



};



exports.getChargeById = function (req, res) {


    var query = Charge.findOne({'transaction.id': req.params.id_charge});
    // var query = Charge.find();

    query.exec(function (err, charge) {
        if (err)
            return handleError(err);


        res.json(charge);




    });
};


exports.getChargeByHost = function (req, res) {


    var query = Charge.find({
        "transaction.description": {"$regex": "Responsable: " + req.params.id_host + " ", "$options": "i"},
        "type": "charge.succeeded",
        "p_status": 1

    });
    //status 1

    query.exec(function (err, charge) {
        if (err)
            return handleError(err);


        res.json(charge);




    });
};



exports.chargeRelease = function (req, res) {

    var ahora = new Date();

    Charge.update(
            {"transaction.description": {"$regex": "Responsable: " + req.params.id_host + " ", "$options": "i"},
                "type": "charge.succeeded",
                "p_status": 1},
            {'$set': {'p_status': 2, 'released_at': ahora}},
            function (err, charge) {
                if (err)
                    res.send(err);

                res.json(true);

            }
    );


};


exports.chargePay = function (req, res) {

    var ahora = new Date();
    console.log("ARREGLOidPay");
    console.dir(req.body.idPay);

    Charge.update({_id: {$in: req.body.idPay}},
            {'$set': {'p_status': 3, 'paid_at': ahora}},
            function (err, charge) {
                if (err)
                    res.send(err);

                res.json(true);

            }
    );


};



/*******************************CRONS************************/




////////////////////////////////////////////////////////////////////////////////////////////
var Persona = require('./modelo/persona');
// Obtiene todos los objetos Persona de la base de datos
exports.getPersona = function (req, res) {
    Persona.find(
            function (err, persona) {
                if (err)
                    res.send(err);
                res.json(persona); // devuelve todas las Personas en JSON		
            }
    );
};

// Guarda un objeto Persona en base de datos
exports.setPersona = function (req, res) {

    // Creo el objeto Persona
    Persona.create(
            {nombre: req.body.nombre, apellido: req.body.apellido, edad: req.body.edad},
            function (err, persona) {
                if (err)
                    res.send(err);

                // Obtine y devuelve todas las personas tras crear una de ellas
                Persona.find(function (err, persona) {
                    if (err)
                        res.send(err);
                    res.json(persona);
                });
            });

};

// Modificamos un objeto Persona de la base de datos
exports.updatePersona = function (req, res) {
    Persona.update({_id: req.params.persona_id},
            {$set: {nombre: req.body.nombre, apellido: req.body.apellido, edad: req.body.edad}},
            function (err, persona) {
                if (err)
                    res.send(err);

                // Obtine y devuelve todas las personas tras crear una de ellas
                Persona.find(function (err, persona) {
                    if (err)
                        res.send(err);
                    res.json(persona);
                });
            });
};

// Elimino un objeto Persona de la base de Datos
exports.removePersona = function (req, res) {
    Persona.remove({_id: req.params.persona_id}, function (err, persona) {
        if (err)
            res.send(err);

        // Obtine y devuelve todas las personas tras borrar una de ellas
        Persona.find(function (err, persona) {
            if (err)
                res.send(err);
            res.json(persona);
        });
    });
};


//// With a JSON doc
//Person.
//  find({
//    occupation: /host/,
//    'name.last': 'Ghost',
//    age: { $gt: 17, $lt: 66 },
//    likes: { $in: ['vaporizing', 'talking'] }
//  }).
//  limit(10).
//  sort({ occupation: -1 }).
//  select({ name: 1, occupation: 1 }).
//  exec(callback);
//  
//// Using query builder
//Person.
//  find({ occupation: /host/ }).
//  where('name.last').equals('Ghost').
//  where('age').gt(17).lt(66).
//  where('likes').in(['vaporizing', 'talking']).
//  limit(10).
//  sort('-occupation').
//  select('name occupation').
// exec(callback);

function isSeen(notis) {
    return !notis.seen;
}

function getRoom(rooms, idRoom) {
    var arr = [];

    for (var i = 0; i < rooms.length; i++) {
        if (Number.parseInt(rooms[i].id_room) === Number.parseInt(idRoom)) {
            arr = rooms[i];
            break;
        }
    }
    return arr;
} 