/* 
 * Copyright (c) 2019 Carlos Cielo.
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v1.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-v10.html
 *
 * Contributors:
 *    Carlos Cielo - initial API and implementation and/or initial documentation
 */


module.exports = function (app) {

    var admin = require('firebase-admin');
    const serviceAccount = require('../../ssl/firebase-key.json');
    var logger = require('../logger/logger.js');

    if (!admin.apps.length) {
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
            databaseURL: "https://hardy-canyon-159005.firebaseio.com"
        });
    }

    app.post("/pushFirebase", pushFirebase);
    app.post("/pushMensajeNuevo", pushMensajeNuevo);


    function pushFirebase(req, res) {

// This registration token comes from the client FCM SDKs.
//var registrationToken = 'cLORYUE7qyE:APA91bF0LJNGVOLam8hwJF6k1BFtdJlwxDKM3DBMtgfy_q38pKCRrw1SvgQtGSH2lYmhHn8_1bAxxRbIGCEtzP9lSpW1roMxDJ_P0s6D6pHRqeJpIAsmExgvn_Yr2VCAbSVBkq1HEY62';
        var registrationToken = 'f4iYMWigIjk:APA91bFPkDqMteVuf8Y_hH2EO418tuG7MrMKnmCubJcWLv0qFmfXZo8N56mIp-JG-5t3z2YD9fLxatCAGfFD5a_0KqXaKsYPA_TpB7-UeEuGsgEx4dJJgihal22ldFMLZlk7owzL2OmL';
// See documentation on defining a message payload.
        var message = {
            data: {
                score: '850',
                time: '2:45'
            },
            token: registrationToken,
            notification: {
                title: "Portugal vs. Denmark",
                body: "great match!"
            }
        };

// Send a message to the device corresponding to the provided
// registration token.
        admin.messaging().send(message)
                .then((response) => {
                    // Response is a message ID string.
                    console.log('Successfully sent message:', response);

                    res.json(response);

                })
                .catch((error) => {
                    console.log('Error sending message:', error);
                    res.status(500).send(error);
                    logger.error(error.toString());


                });

    }
    ;



    function pushMensajeNuevo(req, res) {

        // This registration token comes from the client FCM SDKs.
        //var registrationToken = 'cLORYUE7qyE:APA91bF0LJNGVOLam8hwJF6k1BFtdJlwxDKM3DBMtgfy_q38pKCRrw1SvgQtGSH2lYmhHn8_1bAxxRbIGCEtzP9lSpW1roMxDJ_P0s6D6pHRqeJpIAsmExgvn_Yr2VCAbSVBkq1HEY62';
        // var registrationToken = 'f4iYMWigIjk:APA91bFPkDqMteVuf8Y_hH2EO418tuG7MrMKnmCubJcWLv0qFmfXZo8N56mIp-JG-5t3z2YD9fLxatCAGfFD5a_0KqXaKsYPA_TpB7-UeEuGsgEx4dJJgihal22ldFMLZlk7owzL2OmL';
        var registrationToken = req.body.device;
        var conversationInfo = req.body.conversationInfo;
        // See documentation on defining a message payload.
        var message = {
            data: {
                score: '850',
                time: '2:45'
            },
            token: registrationToken,
            notification: {
                title: "Mensaje Nuevo",
                body: req.body.content
            }
        };

// Send a message to the device corresponding to the provided
// registration token.
        admin.messaging().send(message)
                .then((response) => {
                    // Response is a message ID string.
                    console.log('Successfully sent message:', response);

                    res.json(response);

                })
                .catch((error) => {
                    console.log('Error sending message:', error);
                    res.status(500).send(error);
                    logger.error(error.toString());


                });

    }
    ;
};

