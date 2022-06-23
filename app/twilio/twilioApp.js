/* 
 * Copyright (c) 2021 Carlos Cielo.
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v1.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-v10.html
 *
 * Contributors:
 *    Carlos Cielo - initial API and implementation and/or initial documentation
 */


var User = require('../modelo/User');

module.exports = function (app) {

    const accountSid = 'ACcd730d7ff7cd41744c6fd4c185fed572';
    const authToken = 'a828c8532a568257f78a05b991d6fd19';
    const twiPhone = '+12056547280';


    app.post("/whatsCode", whatsCode);
    app.post("/phoneCode", phoneCode);

    function whatsCode(req, res) {


        const client = require('twilio')(accountSid, authToken);

        client.messages
                .create({
                    body: 'Your Twilio code is 1238432',
                    from: 'whatsapp:+12056547280',
                    to: 'whatsapp:+5215536665704'
                })
                .then(message => console.log(message.sid))
                .done();

    }
    ;

    function phoneCode(req, res) {


        var pin = generaRandom();
        var contenido = 'Mensaje de Roomies Of The World \nTu PIN es : ' + pin;
       
       

        var telefono = req.body.phone.replace(" ", "");

        if (telefono.length === 10) {

            telefono = "+52" + telefono;

        }

        var veri = new Object();
        veri.status = 1;
        veri.type = "PH";
        veri.pin = pin;


        const client = require('twilio')(accountSid, authToken);

        client.messages
                .create({
                    body: contenido,
                    from: twiPhone, //telefono
                    to: telefono
                })
                .then(function (data) {
                    console.log('Administrator notified ' + req.body.idUser);
                    console.dir(veri)

                    User.update(
                            {id_user: req.body.idUser},
                            {$push: {verification: veri}},
                            function (err, user) {
                                if (err)
                                    res.send(err);

                                res.json(1);


                            }
                    );




                })
                .catch(function (err) {
                    console.error('Could not notify administrator');
                    console.error(err);
                });

    }
    ;


    function generaRandom() {

        return Math.floor((Math.random() * 1000000) + 1);
    }


};


//const accountSid = process.env.TWILIO_ACCOUNT_SID;
//const authToken = process.env.TWILIO_AUTH_TOKEN;
//const client = require('twilio')(accountSid, authToken);
//
//client.messages
//  .create({
//     body: 'This is the ship that made the Kessel Run in fourteen parsecs?',
//     from: '+15017122661',
//     to: '+15558675310'
//   })
//  .then(message => console.log(message.sid));