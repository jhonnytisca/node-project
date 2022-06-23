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
var app = angular.module("rotwApp");

app.controller('checkoutCtrl', function ($scope, $http, $location, viviendaService, usuarioService, CONSTANT, EMAIL, API, COM_PER, COM_FIX) {

    var $form = $("#card-form");
    console.log("INICIA CHECKOUT " + $form);


    OpenPay.setId(API.OPENPAYID);
    OpenPay.setApiKey(API.OPENPAYAPI);
    OpenPay.setSandboxMode(API.OPENPAYSANDBOX);


    //Se genera el id de dispositivo
    var deviceSessionId = OpenPay.deviceData.setup("payment-form", "deviceIdHiddenFieldName");


    $scope.userSes = usuarioService.getSessionUser();
    if ($scope.userSes.idUsuario === undefined || $scope.userSes.tipoUsuario !== 3) {
        $location.path("/inicio");
        //pantalla.finish();
    }


    var uPromise = usuarioService.getUserDTO($scope.userSes.idUsuario);
    uPromise.then(function (result) {
        $scope.usuario = result.data;
        console.info("REGRESA DESDE SERVICIO Usuario::  ");
        console.dir(result.data);
    });

    var appli = viviendaService.getApp();
    console.log(appli);

    if (appli === undefined) {
        $location.path("/inicio");
        //pantalla.finish();
    }

    $scope.appli = appli;
    $scope.comi = ((parseFloat($scope.appli.price) * COM_PER.ROTW_ROOMIEPER) + COM_FIX.ROTW_ROOMIEFIX).toFixed(2);
    $scope.tax_comi = parseFloat($scope.comi) * COM_PER.IVA;
    $scope.monto = (parseFloat($scope.appli.price) + parseFloat($scope.comi) + parseFloat($scope.tax_comi)).toFixed(2);


    var viviendaPromise = viviendaService.getById(appli.id_house);
    viviendaPromise.then(function (result) {
        $scope.vivienda = result;

        console.info("REGRESA Vivienda Promise:  ");
        console.dir(result);
        if (appli.id_room !== undefined || appli.id_room !== null) {
            $scope.cuarto = getRoomFromHouse(result, appli.id_room);
        }
        var userPromise = usuarioService.getUserDTO(result.idResponsable);
        userPromise.then(function (result) {
            $scope.responsable = result.data;
            console.info("REGRESA DESDE SERVICIO Usuario::  ");
            console.dir(result.data);
        });

    });

    $scope.checkoutOpenPay = function () {

        console.log("OPEN PAY CHECKOUT");

        console.log(" DEV ICE  SESSIO N ");
        console.dir(deviceSessionId);
        //event.preventDefault();


        $("#pay-button").prop("disabled", true);


        OpenPay.token.extractFormAndCreate('payment-form', success_callbak, error_callbak);



    };


    var success_callbak = function (response) {

        console.log("SUCCESS OPEN");
        console.dir(response);
        document.getElementById("idCheckLoad").style.visibility = "visible";

        var token_id = response.data.id;
        $('#token_id').val(token_id);
        //$('#payment-form').submit();

        var userData = getUserData();

        userData.deviceSessionId = deviceSessionId;
        userData.tokOpenPay = response.data;

        $http.post('/openPayAPI', userData)
                .success(function (data) {
                    console.info("RESPUESTA OPENPAY FROM NODE");
                    console.dir(data);





                    if (data.payment_method !== undefined) {

                        console.dir(data.payment_method);
                        window.open(data.payment_method.url);

                    }


                    var refreshIntervalId = setInterval(checkData, 10000);





                    function checkData() {
                        console.log("CHECAMOS INTERVALO " + new Date());
                        $http.get('/api/charge/' + data.id)
                                .success(function (data1) {

                                    console.log("Webhook check");
                                    console.dir(data1);
                                    console.log(data1.type);
                                    if (data1._id !== undefined) {

                                        if (data1.type === "charge.succeeded") {
                                            console.log("EXITO POR FIN");
                                            notificar('<i class="uk-icon-thumbs-up"></i>  Pago Exitoso', 'success');
                                            $scope.asignarHogar(userData, data.id);
                                        } else if (data1.type === "charge.failed") {

                                            notificar('<i class="uk-icon-warning"></i>  Pago NO aprobado. Contantacte a su banco, o intente con otra tarjeta', 'danger');

                                            $("#pay-button").prop("disabled", false);
                                            document.getElementById("idCheckLoad").style.visibility = "hidden";


                                        }



                                        stopInterval();
                                    } else {

                                        console.log("NOT YET");
                                    }


                                })
                                .error(function (data1) {
                                    console.log('Error MONGO: ' + data1);

                                });
                    }

                    function stopInterval() {

                        /* later */
                        clearInterval(refreshIntervalId);
                    }





                })
                .error(function (data) {
                    console.log('Error SERVER OPENPAY: ');
                    console.dir(data);
                    notificar('<i class="uk-icon-warning"></i>  Error al pagar: NO se generó ningún pago', 'danger');
                    notificar('<i class="uk-icon-warning"></i>' + data.description, 'danger');
                });


    };

    var error_callbak = function (response) {
        console.log("ERROR OPEN");
        console.dir(response);
        var desc = response.data.description != undefined ? response.data.description : response.message;
        //notificar('<i class="uk-icon-warning"></i> '+response.status+' '+desc, 'danger');
        alert("ERROR [" + response.status + "] " + desc);
        $("#pay-button").prop("disabled", false);
    };



    $scope.asignarHogar = function (datos, tok) {

        console.info("ASIGNANDO HOGAR ...");
        var objMongo = new Object();

        var payRoom = true;

        var contrato = new Object();
        var usuarioC = new Object();
        var viviendaC = new Object();
        var cuartoC = new Object();

        objMongo.idLiv = $scope.usuario.idUsuario;
        objMongo.price = datos.monto;
        objMongo.start_at = datos.start_at;
        objMongo.months = datos.months;

        if (datos.idCuarto !== undefined || datos.idCuarto !== null) {
            objMongo.id_room = datos.idCuarto;
        }

        usuarioC.idUsuario = objMongo.idLiv;

        contrato.precioBase = parseFloat($scope.appli.price);

        if (datos.idCuarto !== undefined && datos.idCuarto !== "" && datos.idCuarto !== null) {
            objMongo.idCuarto = datos.idCuarto;
            //GUARDAR DESDE APLICACION

            console.log("idCuarto es valido");
            cuartoC.idCuarto = objMongo.idCuarto;
            contrato.cuarto = cuartoC;
        }

        viviendaC.idVivienda = datos.idVivienda;

        contrato.fechaInicio = new Date();
        contrato.fechaFin = new Date('2099-05-11T00:00:00Z');
        contrato.moneda = 'MXN';
        contrato.comisionRotw = (parseFloat($scope.comi) + parseFloat($scope.tax_comi)).toFixed(2);
        contrato.firma = "FIRMA PRUEBA";




        contrato.usuario = usuarioC;
        contrato.vivienda = viviendaC;



        generaContrato(contrato, tok, objMongo);




    };


    function generaContrato(c, tok, payloadM) {
        //CONSULTA INFO Responsable
        $http.post(CONSTANT.URLWSCONTRATO, c).
                then(function (response) {

                    console.info("Regresa Contrato:::: ");
                    notificar('<i class="uk-icon-clock-o"></i>  Generando Contrato', 'primary');
                    console.dir(response.data);



                    var pago = new Object();
                    var contrato = new Object();

                    contrato.idContrato = response.data;

                    pago.idPago = 0;
                    pago.conekOrder = tok;
                    pago.fechaPago = Date.now();
                    pago.contrato = contrato;

                    payloadM.id_contract = parseInt(contrato.idContrato);


                    var notificacion = new Object();

                    notificacion.id_sender = $scope.userSes.idUsuario;
                    notificacion.content = "Pago de " + $scope.userSes.nombreUsuario + " realizado";
                    notificacion.link = "misViviendas";

                    usuarioService.creaNotificacion($scope.responsable.idUsuario, notificacion);



                    $http.put('/api/house/living_m/' + c.vivienda.idVivienda, payloadM).success(function (data) {
                        console.info("ACTUALIZA ROOMIE EN MONGO");

                        console.dir(data);
                        notificar('<i class="uk-icon-thumbs-up"></i>  ¡Mudando Roomie!', 'success');

                        registraPago(pago);

                    }).error(function (data) {
                        console.log('Error MONGO: ' + data);
                        notificar('<i class="uk-icon-warning"></i>  Error al asignar hogar M: Contacta con soporte', 'danger');

                    });


                }, function (error) {

                    console.info("-----------------ERROR  CONTRATO------------------------");
                    notificar('<i class="uk-icon-warning"></i>  Error al generar contrato: Contacta con soporte', 'danger');
                    console.info(error);
                }
                );

    }
    ;


    function registraPago(p) {

        //CONSULTA INFO Responsable
        $http.post(CONSTANT.URLWSPAGO, p).
                then(function (response) {

                    console.info("Regresa Pago:::: ");
                    console.dir(response.data);
                    notificar('<i class="uk-icon-home"></i>  Ahora puedes acceder a MI HOGAR', 'primary');

                    var pt = p.contrato.precioBase + p.contrato.comisionRotw;
                    /********************************************************CORREO********************************************************************************/
                    var correo = new Object();
                    correo.asunto = "Pago Confirmado";
                    correo.destinatarios = ["support@roomiesoftheworld.com", $scope.userSes.correoElectronico];//
                    correo.plantilla = EMAIL.CONFIRMACION_PAGO;

                    var parametrosCorreo = new Object();
                    parametrosCorreo.nombreAnfitrion = $scope.userSes.nombreUsuario;
                    parametrosCorreo.total = pt;
                    correo.parametros = parametrosCorreo;


                    usuarioService.enviarCorreo(correo);
                    /********************************************************FIN CORREO*****************************************************************************/


                    /********************************************************CORREO********************************************************************************/
                    var correo2 = new Object();
                    correo2.asunto = "Tu roomie ha realizado un pago";
                    correo2.destinatarios = ["support@roomiesoftheworld.com", $scope.responsable.correoElectronico];//$scope.responsable.correoElectronico
                    correo2.plantilla = EMAIL.PAGO_REALIZADO_ROOMIE;

                    var parametrosCorreo2 = new Object();
                    parametrosCorreo2.nombreAnfitrion = $scope.responsable.nombreUsuario;
                    parametrosCorreo2.total = pt;
                    parametrosCorreo2.lugar = " la dirección del inmueble";

                    correo2.parametros = parametrosCorreo2;



                    usuarioService.enviarCorreo(correo2);
                    /********************************************************FIN CORREO*****************************************************************************/





                    $location.path('/miHogar');

                }, function (error) {

                    console.info("-----------------ERROR  PAGO------------------------");
                    notificar('<i class="uk-icon-warning"></i>  Error al asignar hogar: Contacta con soporte', 'danger');
                    console.info(error);
                }
                );

    }
    ;





    function getUserData() {
        var userData = new Object();

        userData.telefono = $scope.usuario.telefono;
        userData.correo = $scope.usuario.correoElectronico;
        userData.nombre = $scope.usuario.nombre + " " + $scope.usuario.primerApellido;
        userData.name = $scope.usuario.nombre;
        userData.lastname = $scope.usuario.primerApellido;
        userData.idResponsable = $scope.responsable.idUsuario;
        if ($scope.cuarto !== undefined && $scope.cuarto !== null && $scope.cuarto.idCuarto !== undefined && $scope.cuarto.idCuarto !== null) {
            userData.idCuarto = $scope.cuarto.idCuarto;
        } else {
            userData.idCuarto = null;
        }
        userData.idVivienda = $scope.vivienda.idVivienda;
        // userData.monto = parseFloat($scope.appli.price);
        userData.monto = parseFloat($scope.monto);
        userData.start_at = $scope.appli.start_at;
        userData.months = $scope.appli.months;


        return userData;


    }


    function getRoomFromHouse(objVivienda, idCuarto) {
        var objCuarto;
        for (var i = 0; i < objVivienda.recamaras.length; i++) {

            if (objVivienda.recamaras[i].idCuarto === idCuarto) {
                objCuarto = objVivienda.recamaras[i];
            }
        }

        return objCuarto;
    }

});


app.controller('3dconfirmcacionCtrl', function ($scope, $http, $location, usuarioService, pagerService, $routeParams, CONSTANT) {

//    $scope.userSes = usuarioService.getSessionUser();
//
//    if ($scope.userSes.idUsuario === undefined || $scope.userSes.tipoUsuario !== 3) {
//        $location.path("/inicio");
//        //pantalla.finish();
//    }

    console.log('3DCONFIRMACION');
    var url = $location.absUrl();
    var pos1 = url.indexOf('?id=');
    var pos2 = url.indexOf('#/');

    var param = url.substring(pos1 + 4, pos2);
    console.log(url);
    console.log(param);

    var refreshIntervalId = setInterval(checkData, 2000);

    function checkData() {
        console.log(param);
        console.log("CHECAMOS INTERVALO " + new Date());
        if (param !== undefined) {
            $http.get('/api/charge/' + param)
                    .success(function (data1) {

                        console.log("Webhook ha llegado");
                        console.dir(data1);
                        if (data1._id !== undefined) {

                            if (data1.type === "charge.succeeded") {
                                console.log("EXITO POR FIN");

                                $("#div1").prop("hidden", true);
                                $("#div2").prop("hidden", false);
                            } else if (data1.type === "charge.failed") {

                                $("#div1").prop("hidden", true);
                                $("#div3").prop("hidden", false);


                            }



                            stopInterval();
                        } else {

                            console.log("AUN NO MAN");
                        }


                    })
                    .error(function (data1) {
                        console.log('Error MONGO: ' + data1);

                    });
        }

    }

    function stopInterval() {

        /* later */
        clearInterval(refreshIntervalId);
    }







});



app.controller('saldoCtrl', function ($scope, $http, $location, $route, usuarioService, COM_PER, COM_FIX) {

    var pantalla = pantallaCarga();
    $scope.aceptaterminos = false;
    $scope.totalBalance = 0;


    $scope.userSes = usuarioService.getSessionUser();

    console.dir($scope.userSes);
    if ($scope.userSes.idUsuario === undefined) {
        $location.path("/inicio");
        pantalla.finish();
    }

    pantalla.finish();



    //LLAMAR CON MONGO
    var userPromise = usuarioService.getUserCharac($scope.userSes.idUsuario);
    userPromise.then(function (result) {
        $scope.user = result.data;
    });


    $http.get("/api/chargeR/" + $scope.userSes.idUsuario).
            then(function (response) {
                $scope.pagos = response.data;

                var i = 0;

                $scope.pagos.forEach(function (element) {


                    var fixplusiva = COM_FIX.ROTW_ROOMIEFIX + (COM_FIX.ROTW_ROOMIEFIX * COM_PER.IVA);
                    console.log(fixplusiva);
                    var bp = (parseFloat(element.transaction[0].amount) - fixplusiva) * COM_PER.COEF;
                    var comihost = parseFloat(bp * COM_PER.ROTW_HOSTPER) + COM_FIX.ROTW_HOSTFIX;
                    var ivahost = parseFloat(comihost * COM_PER.IVA);


                    $scope.pagos[i].montoD = (bp - comihost - ivahost).toFixed(2);


                    $scope.totalBalance = (parseFloat($scope.totalBalance) + parseFloat($scope.pagos[i].montoD)).toFixed(2);

                    i = i + 1;

                });



//                var housestr = "";
//
//
//
//
//
//                $http.get(CONSTANT.URLWSVIVIENDASBYRESPONSABLE + usuarioService.parseId()).
//                        then(function (response) {
//
//                            $scope.misViviendas = response.data;
//
//
//
//                            for (var h = 0; h < $scope.pagos.length; h++) {
//
//                                
//                                
//                               for (var m = 0; m < $scope.misViviendas.length; m++) {
//                                
//                               var strV= $scope.pagos[h].transaction[0].description;
//                               var v1 = strV.indexOf("Vivienda: ");
//                               var v2 = strV.indexOf(" Renta");
//                               var idVivPagoStr= strV.substring(v1+1,v2);
//                               var idVivPago=  parseInt(idVivPagoStr);
//                               
//                               console.log("SUBCADENA"+idVivPago);
//                               
//                               if($scope.misViviendas[m].rentaCuarto){
//                                   
//                                   
//                               var c1 = strV.indexOf("Renta por Cuarto: ");
//                               var c2 = strV.length;
//                               var idCuarPagoStr= strV.substring(c1+1,c2);
//                               var idCuarPago=  parseInt(idCuarPagoStr);
//                               
//                               
//                               console.log("SUBCADENA"+idCuarPago);
//                                  
//                                        for (var c = 0; c < $scope.misViviendas[m].recamaras.length; c++) { 
//                                        
//                                            
//                                            //$scope.misViviendas[m].recamaras[m].idCuarto
//                                        
//                                        }
//                                   
//                                   
//                                   
//                               }
//                                 
////                                if ($scope.pagos[h].transaction[0].description===$scope.misViviendas[m].idVivienda){
////                                    
////                                    
////                                    
////                                    
////                                    
////                                }
//
//                            }
//
//
//
//
//                            }
//
//
//
//                        }, function (error) {
//
//                            console.info("------------------ERROR MIS VIVIENDAS-----------------------");
//                            console.info(error);
//                        }
//                        );







            }, function (error) {

                console.info("-----------------------------------------");
                console.info(error);
            }
            );





    $scope.aceptarTerminosT = function () {


        if ($scope.aceptaterminos === "acepto") {

            desactivaBotonMod();
            console.log("CLIENT");
            console.dir($scope.user);
            if ($scope.user.client.length > 0) {
                var datos = new Object();
                datos.pagos = $scope.pagos;
                datos.client = $scope.user.client;
                var idPay = [];
                $scope.pagos.forEach(function (element) {

                    idPay.push(element._id);
                });


                $http.post('/openPayAPI3ros', datos)
                        .success(function (data) {
                            console.info("RESPUESTA OPENPAY FROM NODE");
                            console.dir(data);
                            notificar('<i class="uk-icon-money"></i>  ¡Transferencia Realizada!', 'success');


                            var objMongo = new Object();
                            objMongo.idPay = idPay;

                            $http.put('/api/c/p/', objMongo).success(function (data1) {

                                console.dir(data1);
                                notificar('<i class="uk-icon-money"></i>  ¡Transferencia registrada!', 'primary');
                                $location.path("/inicio");



                            }).error(function (data) {
                                console.log('Error MONGO: ' + data);
                                notificar('<i class="uk-icon-warning"></i>  Error al registrar transferencia M', 'danger');

                                activaBotonMod();

                            });


                        })
                        .error(function (data) {
                            console.log('Error SERVER OPENPAY: ');
                            console.dir(data);
                            notificar('<i class="uk-icon-warning"></i>  ERROR TRANSFERENCIA. NO SE REALIZÓ PAGO', 'danger');
                            activaBotonMod();
                        });


            } else {

                notificar('<i class="uk-icon-warning"></i>  De de alta una CLABE válida', 'warning');
                activaBotonMod();

            }

        } else {



            notificar('<i class="uk-icon-warning"></i>  Para hacer transferencia de fondos, necesita aceptar los terminos y condiciones', 'warning');

            activaBotonMod();


        }
    };


});




app.controller('checkoutPPCtrl', function ($scope, $http, $location, viviendaService, pagerService, CONSTANT) {

    console.log("INICIA CHECKOUT");


    // Render the PayPal button

    paypal.Button.render({

        // Set your environment

        env: 'sandbox', // sandbox | production

        // Specify the style of the button

        style: {
            layout: 'vertical', // horizontal | vertical
            size: 'responsive', // medium | large | responsive
            shape: 'pill', // pill | rect
            color: 'blue'       // gold | blue | silver | black
        },

        // Specify allowed and disallowed funding sources
        //
        // Options:
        // - paypal.FUNDING.CARD
        // - paypal.FUNDING.CREDIT
        // - paypal.FUNDING.ELV

        funding: {
            allowed: [paypal.FUNDING.CARD, paypal.FUNDING.CREDIT],
            disallowed: []
        },

        // PayPal Client IDs - replace with your own
        // Create a PayPal app: https://developer.paypal.com/developer/applications/create

        client: {
            sandbox: 'AVasZrDV6--wXc-ukaqwFzrkZyi0ztd9bQhrVUVoIFWAfZFHwrKXdSQQMWWJzHfXspvfumZpdyP2d0yA',
            production: '<insert production client id>'
        },

        payment: function (data, actions) {
            return actions.payment.create({
                payment: {
                    transactions: [
                        {
                            amount: {total: '0.01', currency: 'USD'}
                        }
                    ]
                }
            });
        },

        onAuthorize: function (data, actions) {
            return actions.payment.execute().then(function () {
                window.alert('Payment Complete!');
            });
        }

    }, '#paypal-button-container');


});

