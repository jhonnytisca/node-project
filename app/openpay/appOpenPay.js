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

    console.log("OPENPAY");
    var logger = require('../logger/logger.js');

    var PRD = 1;
    var TEST = 0;

    var AMB = PRD;


//ARRAYS
    var OPENPAYMERCHANT = ['mvihyvtx4gxehzs0muu8', 'myamu68b2wid3v4dlwmj'];
    var OPENPAYKEY = ['sk_aeef89733fee44af906ef87fc6394032', 'sk_58c40893f5844dbe8aa95f7959d40dfe'];
    var OPENPAYPROD = [false, true];



    //class
    var Openpay = require('openpay');
    //instantiation is production tercer param
    //var openpay = new Openpay(' your merchant id ', ' your private key ', false);
    var openpay = new Openpay(OPENPAYMERCHANT[AMB], OPENPAYKEY[AMB], OPENPAYPROD[AMB]);

    var openpaytest = new Openpay(OPENPAYMERCHANT[TEST], OPENPAYKEY[TEST], OPENPAYPROD[TEST]);


    app.post("/openPayAPI", payCharge);
    app.post("/openPayAPI3ros", pay3ros);
    app.post("/openPayWebhook", manageWebhook);
    app.post("/openPayClient", creaCliente);
    app.post("/openPayClientAcc", creaClienteCuenta);
    app.post("/openPayAPIAND", payChargeAND);


    function payCharge(req, res) {
        console.log("PAY OPENPAY");

        var porCuarto = "";
        var cadenaCuarto = "";
        var deviceId = req.body.deviceSessionId;

        if (req.body.idCuarto === null) {
            porCuarto = "Renta Casa Completa";
            cadenaCuarto = "Vivienda";
        } else {
            porCuarto = "Renta por Cuarto: " + req.body.idCuarto;
            cadenaCuarto = "Cuarto";
        }


        var deviceIdStr = deviceId;

        if (deviceId.startsWith("and-")) {

            deviceIdStr = deviceId.replace("and-", "");
        }



        var chargeRequest = {
            'source_id': req.body.tokOpenPay.id,
            'method': 'card',
            'amount': req.body.monto,
            'description': "Renta " + cadenaCuarto + " - Responsable: " + req.body.idResponsable + " Vivienda: " + req.body.idVivienda + " " + porCuarto,
            'device_session_id': deviceIdStr,
            'customer': {
                'name': req.body.name,
                'last_name': req.body.lastname,
                'phone_number': '553666574',
                'email': req.body.correo
            },
            "redirect_url": "https://www.roomiesoftheworld.com/#/3dconfirmacion/",
            "use_3d_secure": "true"
        };

        //cambiar use ed secure a true

        // Opcional, si estamos usando puntos
        //chargeRequest.use_card_points = use_card_points;

        console.log("CARGOS");


        openpay.charges.create(chargeRequest, function (error, charge) {



            if (error) {
                res.status(500).send(error);
                logger.error(error.toString());
            }

            res.json(charge);



        });



    }
    ;




    function payChargeAND(req, res) {
        console.log("PAY OPENPAY AND");

        var porCuarto = "";
        var cadenaCuarto = "";
        var deviceId = req.body.deviceSessionId;

        if (req.body.idCuarto === null) {
            porCuarto = "Renta Casa Completa";
            cadenaCuarto = "Vivienda";
        } else {
            porCuarto = "Renta por Cuarto: " + req.body.idCuarto;
            cadenaCuarto = "Cuarto";
        }


        var deviceIdStr = deviceId;

        if (deviceId.startsWith("and-")) {

            deviceIdStr = deviceId.replace("and-", "");
        }



        var chargeRequest = {
            'source_id': req.body.tokOpenPay.id,
            'method': 'card',
            'amount': req.body.monto,
            'description': "Renta " + cadenaCuarto + " - Responsable: " + req.body.idResponsable + " Vivienda: " + req.body.idVivienda + " " + porCuarto,
            'device_session_id': deviceIdStr,
            'customer': {
                'name': req.body.name,
                'last_name': req.body.lastname,
                'phone_number': '553666574',
                'email': req.body.correo
            },
            "redirect_url": "https://www.roomiesoftheworld.com/#/3dconfirmacion/",
            "use_3d_secure": "true"
        };



        console.log("CARGOS");


        openpaytest.charges.create(chargeRequest, function (error, charge) {



            if (error) {
                console.dir(error);
                res.status(500).send(error);
                logger.error(error.toString());
            }

            res.json(charge);



        });



    }
    ;


    function pay3ros(req, res) {
        console.log("PAY Terceros");

        var totalBalance = 0;
        var ahora = new Date;


        req.body.pagos.forEach(function (element) {


            var bp = element.transaction[0].amount * 0.934928945;
            var comihost = (bp * 0.025) + 150;
            var ivahost = (comihost * 0.16);


            var montoD = (bp - comihost - ivahost).toFixed(2);

            totalBalance = totalBalance + montoD;



        });


        //GET CLIENT
        if (req.body.client[0] !== undefined) {



            var searchParams = {
                'limit': 1
            };

            openpay.customers.bankaccounts.list(req.body.client[0].id, searchParams, function (error, list) {


                var payout = {
                    "method": "bank_account",
                    'destination_id': list[0].id,
                    "amount": totalBalance,
                    "description": "Transferencia a socio del " + ahora.toString(),
                    'order_id': 'T3RO-' + ahora.toString()
                };


                openpay.customers.payouts.create(req.body.client[0].id, payout, function (error, body) {
                    if (error) {
                        res.status(500).send(error);
                        logger.error(error.toString());
                    }

                    res.json(true);
                });



            });







        } else {

            res.status(500).send(false);
        }


    }
    ;



    function manageWebhook(req, res) {
        console.log("Webhook");

        var Charge = require('../modelo/Charge');

        console.dir(req.body);
        console.log("TIPO   " + req.body.type);

        if (req.body.type === "charge.succeeded" || req.body.type === "charge.failed") {
            console.log("CREAR CARGO MONGO");

            var cargo = new Object();
            var transaccion = new Object();
            var tarjeta = new Object();

            cargo = req.body;
            transaccion = req.body.transaction;
            tarjeta = req.body.transaction.card;

            cargo.transaction = [transaccion];
            cargo.card = [tarjeta];



            // Creo el objeto House
            Charge.create(cargo,
                    function (err, charge) {
                        if (err) {
                            res.status(500).send(err);
                            logger.error("_OPENP " + err.toString());
                        }

                        res.json(1);

                    });

        }


        res.json(1);


    }
    ;


    function creaCliente(req, res) {
        console.log("Crea Cliente");
        console.dir(req.body);



        var customerRequest = {
            'name': req.body.name,
            'last_name': req.body.last_name,
            'email': req.body.email,
            'requires_account': false,
            'external_id': req.body.external_id.toString(),
            'status': "active",
            'balance': 103
        };

        openpay.customers.create(customerRequest, function (error, body) {
            if (error) {
                res.status(500).send(error);
                logger.error("_OPENP " + error.toString());
            }


            res.json(body);



        });



    }
    ;


    function creaClienteCuenta(req, res) {
        console.log("Crea cuenta");

        var bankaccountRequest = {
            'clabe': req.body.clabe,
            'alias': 'Cuenta principal ' + req.body.external_id.toString(),
            'holder_name': req.body.name + " " + req.body.last_name
        };

        openpay.customers.bankaccounts.create(req.body.id, bankaccountRequest, function (errorb, bankaccount) {

            if (errorb) {
                res.status(500).send(errorb);
                logger.error("_OPENP " + errorb.toString());
            }

            res.json(bankaccount);

        });




    }
    ;
};





//openpay.setTimeout(20000); // in ms (default is 90000ms)
//openpay.setMerchantId(' your merchant id ');
//openpay.setPrivateKey(' your private key ');
//openpay.setProductionReady(true);