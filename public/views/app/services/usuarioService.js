var app = angular.module("rotwApp");

//var crypto = require('crypto');
//var jwt = require('jsonwebtoken');

app.service('usuarioService', function ($auth, $http, CONSTANT) {

    var idUsuario;
    var salt = "";
    var hash = "";
    var precarga;

    var sendId = function (id) {
        //productList.push(newObj);
        idUsuario = id;
    };

    var getId = function () {
        return idUsuario;
    };
    
    
     var sendPrecarga = function (user) {
        //productList.push(newObj);
        precarga = user;
    };

    var getPrecarga = function () {
        return precarga;
    };

    var getHash = function () {
        return hash;
    };

    var getSalt = function () {
        return salt;
    };

    var setPassword = function (password) {
        salt = crypto.randomBytes(16).toString('hex');
        hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64).toString('hex');
    };


    var parseId = function () {
        var base64Url = $auth.getToken().split('.')[1];
        var base64 = base64Url.replace('-', '+').replace('_', '/');
        var ato = window.atob(base64);
        var jwtSes = JSON.parse(ato);
        var idUsuario = JSON.parse(jwtSes.sub).idUsuario;

        console.log(window.atob(base64));
        console.log(jwtSes);
        console.log(idUsuario);

        return idUsuario;
    };

    var getSessionUser = function () {
        
        var tok= false;
        console.log(window.localStorage.getItem("sesType"));
        
        if (window.localStorage.getItem("sesType") === "FIncom") {
           
            //tok=JSON.parse(window.sessionStorage.accessToken);
             tok=JSON.parse(window.localStorage.getItem("sesTokAux"));
             console.log("TOKEN  session F incom");
             console.dir(tok);
        }
        else if(window.localStorage.getItem("sesType") === "N" || window.localStorage.getItem("sesType") === "F"){
           
            if ($auth.getToken() !== null) {
                var base64Url = $auth.getToken().split('.')[1];
                var base64 = base64Url.replace('-', '+').replace('_', '/');
                var ato = window.atob(base64);
                var jwtSes = JSON.parse(ato);
                tok = JSON.parse(jwtSes.sub);
                tok.completo= true;

            } 
    
        }
        
        return tok;
    };


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

    var creaNotificacion = function (idUser, notificacion) {


        return $http.put('/api/user/noti/' + idUser, notificacion)
                .success(function (data) {
                    console.info("CREA NOTIFICACION");

                    return data;
                }, function (error) {

                    console.info("------------------ERROR SERVICIO USUARIO M NOTIFICACIONES-----------------------");
                    console.info(error);

                    return error;
                });

    };


    var leeNotificacion = function (idNotificacion) {

        var leer = new Object();
        leer.idNotificacion = idNotificacion;

        return $http.put('/api/user/notiread/', leer)
                .success(function (data) {
                    console.info("Lee NOTIFICACION");

                    return data;
                }, function (error) {

                    console.info("------------------ERROR SERVICIO USUARIO M NOTIFICACIONES-----------------------");
                    console.info(error);

                    return error;
                });

    };

    var getUserNotis = function (idUser) {


        return $http.get('/api/user/noti/' + idUser)
                .success(function (data) {

                    return data;
                }, function (error) {

                    console.info("------------------ERROR SERVICIO USUARIO M-----------------------");
                    console.info(error);

                    return error;
                });

    };

    var setFBProfile = function (idUser, notificacion) {


        return $http.put('/api/user/noti/' + idUser, notificacion)
                .success(function (data) {
                    console.info("CREA NOTIFICACION");

                    return data;
                }, function (error) {

                    console.info("------------------ERROR SERVICIO USUARIO M NOTIFICACIONES-----------------------");
                    console.info(error);

                    return error;
                });

    };

    var getCheckInRoomie = function (idC) {

        return $http.get(CONSTANT.URLWSGETCHECKIN + idC + '?esRoomie=true')
                .success(function (data) {

                    return data;

                }, function (error) {

                    console.info("------------------ERROR CHECK CHECKIN USUARIO M-----------------------");
                    console.info(error);

                    return error;

                });

    };


    var getCheckInHost = function (idC) {

        return $http.get(CONSTANT.URLWSGETCHECKIN + idC + '?esRoomie=false')
                .success(function (data) {

                    return data;

                }, function (error) {

                    console.info("------------------ERROR CHECK CHECKIN USUARIO M-----------------------");
                    console.info(error);

                    return error;

                });

    };

    var manageDevices = function (cassObject) {

        //idUser, f_token
        var deviceList = [];

        return $http.get("/cass/device/" + cassObject.idUser)
                .success(function (device) {

                    console.dir(device);

                    if (device === "") {

                        console.log("IF NO EXISTS, SAVE");

                        $http.post("/cass/device", cassObject)
                                .success(function (data) {

                                    console.log("REGISTERED");
                                    return data.devices;
                                }, function (error) {

                                    console.info("------------------ERROR SERVICIO CASS-----------------------");
                                    console.info(error);
                                    return error;
                                });



                    } else {

                        console.log("EXISTS, TRY TO PUSH");

                        //VALIDATE IF DEVICE IS LINKED TO USER
                        for (var i = 0; i < device.devices.length; i++) {

//                            if (device.devices[i] === cassObject.f_token) {
                                cassObject.idSession = device.id_session;
                                $http.put("/cass/device", cassObject)
                                        .success(function (data) {

                                            console.log("PUSH DEVICE");

                                            return data;
                                        }, function (error) {

                                            console.info("------------------ERROR SERVICIO CASS-----------------------");
                                            console.info(error);
                                            return error;
                                        });

                                break;
                            }
//                        }
                       // return device;
                    }



                }, function (error) {

                    console.info("------------------ERROR SERVICIO CASS-----------------------");
                    console.info(error);

                    return error;

                });

    };
    
    
    
     var enviarCorreo = function (correo) {


        return $http.post(CONSTANT.URLWSEMAIL , correo)
                .success(function (data) {
                    console.info("RESPUESTA EMAIL FROM NODE");
                    console.dir(data);

                })
                .error(function (data) {
                    console.log('Error SERVER EMAIL: ');
                    console.dir(data);
                });

    };

    return {
        sendId: sendId,
        getId: getId,
        getHash: getHash,
        getSalt: getSalt,
        setPassword: setPassword,
        parseId: parseId,
        getSessionUser: getSessionUser,
        getUserDTO: getUserDTO,
        getUsersByIdIN: getUsersByIdIN,
        getUserCharac: getUserCharac,
        creaNotificacion: creaNotificacion,
        leeNotificacion: leeNotificacion,
        getUserNotis: getUserNotis,
        setFBProfile: setFBProfile,
        getCheckInRoomie: getCheckInRoomie,
        getCheckInHost: getCheckInHost,
        manageDevices: manageDevices,
        sendPrecarga:sendPrecarga,
        getPrecarga:getPrecarga,
        enviarCorreo:enviarCorreo
    };

});

