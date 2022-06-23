/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
var app = angular.module("rotwApp");

app.controller('initConversationCtrl', function ($http, $scope, $location, usuarioService, viviendaService, firebaseService, EMAIL, CONSTANT) {
    console.log("Mensajeria ENTRAR");

    $scope.enviar = function () {

        console.log("NG MODEL " + $scope.mensaje);

        var idSender = usuarioService.getSessionUser().idUsuario;
        var idReceiver = viviendaService.getId();


        var objMongo = new Object();
        var participantes = [];
        participantes.push(idSender);
        participantes.push(idReceiver);
        var mensajes = [];
        var objMongoMensaje = new Object();
        objMongoMensaje.id_sender = idSender;
        objMongoMensaje.content = removeNumbers($scope.mensaje);
        mensajes.push(objMongoMensaje);

        objMongo.idParticipantes = participantes;
        objMongo.mensajes = mensajes;

        $http.post('/api/conversation', objMongo)
                .success(function (data) {

                    console.info("CREA CONVERSACION EN MONGO");
                    //UIkit.modal("#id-ban-message").hide();
                    $location.path("/bandeja");

                    notificar('<i class="uk-icon-thumbs-up"></i>  ¡Has iniciado una conversación! Verifica tus mensaje', 'success');


//                    var ftoken = 'f4iYMWigIjk:APA91bFPkDqMteVuf8Y_hH2EO418tuG7MrMKnmCubJcWLv0qFmfXZo8N56mIp-JG-5t3z2YD9fLxatCAGfFD5a_0KqXaKsYPA_TpB7-UeEuGsgEx4dJJgihal22ldFMLZlk7owzL2OmL';
//                    var pushPromise = firebaseService.pushMensajeNuevo(ftoken, $scope.mensaje);
//                    pushPromise.then(function (result) {
//                        console.info("REGRESA PROMISE PUSH::  ");
//                        console.dir(result.data);
//                    });


                    //CONSULTA INFO Responsable
                    $http.get(CONSTANT.URLWSUSUARIOS + idReceiver).
                            then(function (response) {
                                $scope.responsable = response.data;
                            }, function (error) {

                                console.info("------------------ERROR SERVICIO USUARIO-----------------------");
                                console.info(error);
                            }
                            );

                    var notificacion = new Object();
                    notificacion.id_sender = idSender;
                    notificacion.content = "Mensaje Nuevo";
                    notificacion.link = "bandeja";
                    usuarioService.creaNotificacion(idReceiver, notificacion);


                    /********************************************************CORREO********************************************************************************/
                    var correo = new Object();
                    correo.asunto = "Mensaje sin leer";
                    correo.destinatarios = ["support@roomiesoftheworld.com", $scope.responsable.correoElectronico];//$scope.responsable.correoElectronico
                    correo.plantilla = EMAIL.MENSAJE_RECIBIDO_ROOMIE;

                    var parametrosCorreo = new Object();
                    //Receiver
                    parametrosCorreo.nombreAnfitrion = $scope.responsable.nombre + " " + $scope.responsable.primerApellido;
                    //Sender
                    parametrosCorreo.nombreUsuario = $scope.userSes.nombreUsuario;

                    correo.parametros = parametrosCorreo;


                    usuarioService.enviarCorreo(correo);
                    /********************************************************FIN CORREO*****************************************************************************/





                })
                .error(function (data) {
                    console.log('Error MONGO: ' + data);
                    // UIkit.modal("#id-ban-message").hide();
                    notificar('<i class="uk-icon-warning"></i>  Error al añadir al crear conversación', 'danger');
                });




    }
});

app.controller('agregaMensajeCtrl', function ($http, $scope, $location, usuarioService, viviendaService, firebaseService, EMAIL, CONSTANT) {
    console.log("Mensajeria ENTRAR");


    $scope.enviar = function () {
        console.log("NG MODEL " + $scope.mensaje);

        var objMongo = new Object();
        var objMongoMensaje = new Object();
        $scope.userSes = usuarioService.getSessionUser();

        objMongoMensaje.id_sender = $scope.userSes.idUsuario;
        objMongoMensaje.content = removeNumbers($scope.mensaje);
        objMongo.mensaje = objMongoMensaje;

        $http.put('/api/conversation/' + viviendaService.getId(), objMongo)
                .success(function (data) {

                    console.info("AGREGA MENSAJE EN MONGO");
                    console.dir(data);

//                    var ftoken = 'f4iYMWigIjk:APA91bFPkDqMteVuf8Y_hH2EO418tuG7MrMKnmCubJcWLv0qFmfXZo8N56mIp-JG-5t3z2YD9fLxatCAGfFD5a_0KqXaKsYPA_TpB7-UeEuGsgEx4dJJgihal22ldFMLZlk7owzL2OmL';
//                    var pushPromise = firebaseService.pushMensajeNuevo(ftoken, $scope.mensaje);
//                    pushPromise.then(function (result) {
//                        console.info("REGRESA PROMISE PUSH::  ");
//                        console.dir(result.data);
//                    });





                    var notificacion = new Object();
                    notificacion.id_sender = objMongoMensaje.id_sender;
                    notificacion.content = "Mensaje Nuevo";
                    notificacion.link = "bandeja";
                    var idReceiver = getReceiver(data.id_participants, objMongoMensaje.id_sender);
                    console.log(idReceiver);
                    console.dir(data.id_participants);
                    console.log(objMongoMensaje.id_sender);
                    usuarioService.creaNotificacion(idReceiver, notificacion);


                    $http.get(CONSTANT.URLWSUSUARIOS + idReceiver).
                            then(function (response) {
                                $scope.receiver = response.data;



                                /********************************************************CORREO********************************************************************************/
                                var correo = new Object();
                                correo.asunto = "Mensaje respondido";
                                correo.destinatarios = ["support@roomiesoftheworld.com", $scope.receiver.correoElectronico];//$scope.responsable.correoElectronico
                                correo.plantilla = EMAIL.MENSAJE_RECIBIDO_ROOMIE;

                                var parametrosCorreo = new Object();
                                //Receiver
                                parametrosCorreo.nombreAnfitrion = $scope.receiver.nombre + " " + $scope.receiver.primerApellido;
                                //Sender
                                parametrosCorreo.nombreUsuario = $scope.userSes.nombreUsuario;

                                correo.parametros = parametrosCorreo;


                                usuarioService.enviarCorreo(correo);
                                /********************************************************FIN CORREO*****************************************************************************/



                            }, function (error) {

                                console.info("------------------ERROR SERVICIO USUARIO-----------------------");
                                console.info(error);
                            }
                            );




                    //Refresca mensajes
                    $scope.mensaje = "";
                    console.log($scope.conversaciones);
                    $scope.conversaciones = updateViewMessages($scope.conversaciones, data);


                })
                .error(function (data) {
                    console.log('Error MONGO: ' + data);
                });

    };


});

app.controller('consultaConversacionesCtrl', function ($http, $scope, $location, usuarioService, viviendaService, CONSTANT) {
    console.log("Consulta Conversaciones ENTRAR");
    $scope.userSes = usuarioService.getSessionUser().idUsuario;

    if ($scope.userSes === undefined) {
        $location.path("/inicio");

    }




    var objMongoCon = new Object();
    $http.get('/api/conversation/' + $scope.userSes, objMongoCon)
            .success(function (data) {
                console.log("Conversaciones para " + $scope.userSes);
                console.dir(data);
                console.log(data.length);

                if (data.length == 0) {

                    $location.path("/perfil");
                    notificar('<i class="uk-icon-warning"></i>  Aún no tienes conversaciones', 'warning');
                }

                $scope.conversaciones = data;

                $scope.loadParams($scope.conversaciones[0]._id);


                var idUsersStr = getIdStrFromConversation($scope.userSes, $scope.conversaciones);

                if (idUsersStr !== "") {
                    var usuariosPromise = usuarioService.getUsersByIdIN(idUsersStr);
                    usuariosPromise.then(function (result) {
                        //$scope.tiposVivienda = result.data;
                        console.info("REGRESA DESDE SERVICIO USUARIO PROMISE::  " + result.data);
                        console.dir(result.data);

                        mergeUserVsConversation($scope.conversaciones, result.data);
                    });
                }

            });


    $scope.loadParams = function (idConversacionView) {
        viviendaService.sendId(idConversacionView);
    };

});



function getIdStrFromConversation(idSes, conversations) {
    var idUsersStr = "";
    conversations.forEach(function (element) {

        console.dir(element);

        if (element.id_participants[0] === idSes) {

            idUsersStr = element.id_participants[1] + "-" + idUsersStr;
        }
        if (element.id_participants[1] === idSes) {
            idUsersStr = element.id_participants[0] + "-" + idUsersStr;
        }


    });

    idUsersStr = idUsersStr.replace("-null", "");
    idUsersStr = idUsersStr.replace("null-", "");

    if (idUsersStr.substring(idUsersStr.length - 1) === "-")
        idUsersStr = idUsersStr.substring(0, idUsersStr.length - 1);

    console.log(idUsersStr);
    return idUsersStr;
}


function mergeUserVsConversation(conversationsList, usersList) {

    for (var i = 0; i < conversationsList.length; i++) {

        for (var j = 0; j < usersList.length; j++) {

            if (conversationsList[i].id_participants[0] === usersList[j].idUsuario) {
                conversationsList[i].user = usersList[j];
            }
            if (conversationsList[i].id_participants[1] === usersList[j].idUsuario) {
                conversationsList[i].user = usersList[j];

            }

        }

    }

    console.dir(conversationsList);
}

function updateViewMessages(messages, dataMsj) {

    console.log("INTENTAMOS ACTYUALIZAR CONVER");

    console.dir(messages);
    console.dir(dataMsj);

    for (var i = 0; i < messages.length; i++) {

        if (messages[i]._id === dataMsj._id) {
            var userTemp = messages[i].user;
            messages[i] = dataMsj;
            messages[i].user = userTemp;
            break;
        }
    }


    return messages;
}

function getReceiver(participantes, sender) {
    var receiver = "";
    console.log("GET RECEIVERS");
    console.log(sender);
    console.log(participantes);
    if (participantes[0] === sender) {

        receiver = participantes[1];
    } else if (participantes[1] === sender) {

        receiver = participantes[0];
    }

    return receiver;
}

function removeNumbers(str) {
    var result = "";

    result = str.replaceAll("1", "X").replaceAll("2", "X").replaceAll("3", "X").replaceAll("4", "X").replaceAll("5", "X").replaceAll("6", "X").replaceAll("7", "X").replaceAll("8", "X").replaceAll("9", "X").replaceAll("0", "X");

    return result;
}