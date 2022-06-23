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

const Agenda = require('agenda');
const mongoConnectionString = 'mongodb://127.0.0.1/rotw';
const agenda = new Agenda({db: {address: mongoConnectionString}});
var logger = require('../logger/logger.js');

var House = require('../modelo/House');

module.exports = function (app) {
    // 'living.updated_at':{$lt : Date.now()}'aspirants.status': 2, 

    var ahora = new Date();
    console.log();

    agenda.define('EXPIRA_PAGO', (job, done) => {
        House.update({'aspirants.updated_at': {$lt: ahora}, 'aspirants.status': 2},
                {$set: {'aspirants.$.status': 3}},
                {multi: true},
                function (err, house) {

                    if (err) {
                        console.log("ERROR JOB");
                        logger.error(err.toString());
                    }

                    console.log("Pagos expirados");
                    console.dir(house);
                    logger.info("Pagos expirados: " + house.toString()+" Hora: "+ahora);

                }
        );
        console.log("AGENDA EJECUTADA");
    });



    (async function () { // IIFE to give access to async/await
        await agenda.start();

        await agenda.every('10 minutes', 'EXPIRA_PAGO');

        // Alternatively, you could also do:
        // await agenda.every('*/3 * * * *', 'delete old users');
    })();



};