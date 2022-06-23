var app = angular.module("rotwApp");

app.service('viviendaService', function ($http, $route, CONSTANT) {
    var idVivienda;
    var idCuarto;
    var idApp;

    var sendId = function (id) {
        //productList.push(newObj);
        idVivienda = id;
    };

    var getId = function () {
        return idVivienda;
    };

    var sendCuartoId = function (id) {
        //productList.push(newObj);
        idCuarto = id;
    };

    var getCuartoId = function () {
        return idCuarto;
    };

    var getAll = function () {

        return $http.get(CONSTANT.URLWSVIVIENDAS).
                then(function (response) {
                    var listaViviendas = [];
                    response.data.forEach(function (element) {

                        if (isNaN(element)) {
                            listaViviendas.push(element);
                        }

                    });

                    console.dir(listaViviendas);
                    return listaViviendas;

                }, function (error) {

                    console.info("----------------Error SERVICIO VIVIENDAS----------------------");
                    console.info(error);
                    return error;
                }
                );



    };



    var getById = function (idVivienda) {

        return $http.get(CONSTANT.URLWSVIVIENDAS + idVivienda).
                then(function (response) {


                    console.dir(response.data);
                    return response.data;

                }, function (error) {

                    console.info("----------------Error SERVICIO VIVIENDAS----------------------");
                    console.info(error);
                    return error;
                }
                );
    };


    var getCaracById = function (idVivienda) {

        return $http.get('/api/house/' + idVivienda).
                then(function (response) {

                    console.dir(response);
                    return response.data;

                }, function (error) {

                    console.info("----------------Error Mongo----------------------");
                    console.info(error);
                    return error;
                }
                );
    };

    var sendApp = function (app) {
        //productList.push(newObj);
        idApp = app;

    };

    var getApp = function () {
        //productList.push(newObj);
        return idApp;

    };

    var getCuartoById = function (idCuarto) {

        return $http.get(CONSTANT.URLWSCUARTOS + idCuarto).
                then(function (response) {


                    console.dir(response.data);
                    return response.data;

                }, function (error) {

                    console.info("----------------Error SERVICIO Cuartos----------------------");
                    console.info(error);
                    return error;
                }
                );
    };

    var getCaracByRoomId = function (idRoom) {

        return $http.get('/api/rooms/house/' + idRoom).
                then(function (response) {

                    console.dir(response.data);
                    return response.data;

                }, function (error) {

                    console.info("----------------Error Mongo----------------------");
                    console.info(error);
                    return error;
                }
                );
    };


    var confirmaLlegadaRoomie = function (payload) {
        
       
        payload.roomieCheckin = new Date();
        payload.roomieCheckinSt = "1";
        
        //true roomie false responsable


        return $http.put(CONSTANT.URLWSCHECKIN + '?esRoomie=true', payload)
                .success(function (data) {
                    console.info("RESPUESTA checkin");
                    console.dir(data);
                    notificar('<i class="uk-icon-thumbs-up"></i>  ¡Has confirmado tu llegada!', 'success');
                    $route.reload();
                    return data;


                })
                .error(function (data) {
                    console.log('Error SERVER checkin: ');
                    console.dir(data);

                    return data;
                });

    };
    
    var confirmaLlegadaHost = function (payload) {
        
       
        payload.responsableCheckin = new Date();
        payload.responsableCheckinSt = "1";
        
        //true roomie false responsable


        return $http.put(CONSTANT.URLWSCHECKIN + '?esRoomie=false', payload)
                .success(function (data) {
                    console.info("RESPUESTA checkin");
                    console.dir(data);
                   
                    var objMongo = new Object();
                    return $http.put('/api/house/living_k/' + payload.idApp, objMongo).success(function (data1) {

                            console.log("LIVING STATUS MONGO");
                            console.dir(data1);
                            notificar('<i class="uk-icon-thumbs-up"></i>  ¡Has entregado llaves!', 'success');
                            $route.reload();
                            return data1;

                        })
                                .error(function (data1) {
                                    console.log('Error MONGO: ' + data1);
                                   notificar('<i class="uk-icon-warning"></i>  Error al entregar llaves M', 'danger');
                                    return data1;
                                });
                    

                })
                .error(function (data) {
                    console.log('Error SERVER checkin: ');
                    console.dir(data);

                    return data;
                });

    };

    return {
        sendId: sendId,
        getId: getId,
        getAll: getAll,
        getById: getById,
        getCaracById: getCaracById,
        getCuartoId: getCuartoId,
        sendCuartoId: sendCuartoId,
        sendApp: sendApp,
        getApp: getApp,
        getCuartoById: getCuartoById,
        getCaracByRoomId: getCaracByRoomId,
        confirmaLlegadaRoomie: confirmaLlegadaRoomie,
        confirmaLlegadaHost: confirmaLlegadaHost

    };

});
