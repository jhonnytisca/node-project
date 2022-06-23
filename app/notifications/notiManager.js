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

module.exports = function (http) {

    var io = require('socket.io')(http);
 


//NOTIFICATIONS
    io.on('connection', function (socket) {
        // This event will trigger when any user is connected.
        // You can use 'socket' to emit and receive events.
        console.log("CONECTADO");


        socket.on('aplicacion', function (data) {
            // When any connected client emit this event, we will receive it here.
            console.log("MENSAJE");
            io.emit('something'); // for all.
            socket.broadcast.emit('something'); // for all except me.

        });
    });



};

