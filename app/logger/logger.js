/* 
 * Copyright (c) 2020 Carlos Cielo.
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v1.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-v10.html
 *
 * Contributors:
 *    Carlos Cielo - initial API and implementation and/or initial documentation
 */


//Logger
const winston = require('winston');

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    defaultMeta: {service: 'user-service'},
    transports: [
        //
        // - Write all logs with level `error` and below to `error.log`
        // - Write all logs with level `info` and below to `combined.log`
        //
        new winston.transports.File({filename: 'log/error.log', level: 'error'}),
        new winston.transports.File({filename: 'log/info.log', level: 'info'}),
        new winston.transports.File({filename: 'log/combined.log'})
    ]
});


var today = new Date();
var date = today.toISOString().slice(0, 10)+":"+today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();

var methods = {
    error: function (message) {
        logger.error("ERROR::: ["+date+"] "+message);
    },
    info: function (message) {
        logger.info("INFO ::: ["+date+"] "+message);
    }
};


module.exports = methods;