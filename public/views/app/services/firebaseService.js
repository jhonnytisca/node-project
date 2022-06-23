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


var app = angular.module("rotwApp");

//var crypto = require('crypto');
//var jwt = require('jsonwebtoken');

app.service('firebaseService', function ($http, CONSTANT) {


    var getUserDTO = function (idUser) {

        return $http.get(CONSTANT.URLWSUSUARIOS + idUser).
                then(function (response) {
                    return response;

                }, function (error) {
                    return error;
                }
                );

    };

    var getUsersByIdIN = function (idUsersStr) {

        if (idUsersStr !== "") {
            return $http.get(CONSTANT.URLWSUSUARIOSIN + idUsersStr).
                    then(function (response) {

                        return response;

                    }
                    , function (error) {

                        console.info("-----------------ERROR IN USUARIOS------------------------");
                        console.info(error);
                        return error;
                    });
        }
    };

    var getUserCharac = function (idUser) {


        return $http.get('/api/user/' + idUser)
                .success(function (data) {

                    return data;
                }, function (error) {

                    console.info("------------------ERROR SERVICIO USUARIO M-----------------------");
                    console.info(error);

                    return error;
                });

    };

    var pushMensajeNuevo = function (device, content) {

        var push = new Object();
        push.device=device;
        push.content=content;

        return $http.post('/pushMensajeNuevo', push)
                .success(function (data) {
                    console.info("RESPUESTA FIREBASE FROM NODE");
                    console.dir(data);

                    return data;

                })
                .error(function (data) {
                    console.log('Error FIREBASE: ');
                    console.dir(data);

                    return data;
                });

    };

    return {
        getUserDTO: getUserDTO,
        getUsersByIdIN: getUsersByIdIN,
        getUserCharac: getUserCharac,
        pushMensajeNuevo: pushMensajeNuevo
    };

});

