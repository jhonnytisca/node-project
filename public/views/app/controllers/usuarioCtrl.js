/* 
 * Jhonny Tiscareño Ramirez - 2022
 * New features and corrections.
 */

var app = angular.module("rotwApp");


app.controller('validphoneCtrl', function ($scope, $http, $location, usuarioService, CONSTANT) {

    $scope.userSes = usuarioService.getSessionUser();
    if ($scope.userSes.idUsuario === undefined || $scope.userSes.tipoUsuario !== 4) {
        $location.path("/inicio");
        pantalla.finish();
    }


    var userPromise = usuarioService.getUserDTO($scope.userSes.idUsuario);
    userPromise.then(function (result) {
        $scope.user = result.data;
        console.info("REGRESA DESDE SERVICIO Usuario::  ");
        console.dir(result.data);
        $scope.user.nombreUsuario = "";
    });


    $scope.valida = function () {
        var objMongo = new Object();

        objMongo.pin = $scope.user.pin;


        $http.put('api/phone/pin/' + $scope.userSes.idUsuario, objMongo)
                .success(function (data) {

                    console.dir(data);
                    notificar('<i class="uk-icon-warning"></i>  PIN Valido', 'success');


                })
                .error(function (data) {
                    console.log('Error PIN: ');
                    console.dir(data);
                    notificar('<i class="uk-icon-warning"></i>  PIN INVALIDO', 'warning');
                    activaBoton();

                });

    };
});





app.controller('consumirUsuariosCtrl', function ($scope, $http, $location, viviendaService, CONSTANT) {
    var pantalla = pantallaCarga();

    pantalla.finish();
    $http.get(CONSTANT.URLWSVIVIENDAS).
            then(function (response) {
                $scope.viviendas = response.data;
                console.info(response);

            }, function (error) {

                console.info("-----------------------------------------");
                console.info(error);
            }
            );


    $scope.loadDetalle = function (idViviendaView) {
        viviendaService.sendId(idViviendaView);
        console.info("LOAD DETALLE " + idViviendaView);
        $location.path("/consultarVivienda");

    };


});

app.controller('altaRoomieCtrl', function ($scope, $http, $location, usuarioService, CONSTANT) {
    var pantalla = pantallaCarga();
    // cerrarModal();
    var obj = new Object();
    $scope.master = {};

    $scope.nombreTouched = false;
    $scope.primerApellidoTouched = false;
    $scope.correoTouched = false;
    $scope.nombreUsuarioTouched = false;
    $scope.passwordTouched = false;
    $scope.confirmaPasswordTouched = false;
    $scope.descripcionTouched = false;
    $scope.mensajeTouched = false;

    console.info("ENTRO AGREGAR ROOMIE");

    pantalla.finish();

    $scope.reset = function () {
        //$scope.user = angular.copy($scope.master);
        $scope.nombreTouched = false;
        $scope.primerApellidoTouched = false;
        $scope.correoTouched = false;
        $scope.nombreUsuarioTouched = false;
        $scope.passwordTouched = false;
        $scope.confirmaPasswordTouched = false;
        $scope.descripcionTouched = false;
        $scope.mensajeTouched = false;
    };


    $scope.fecha18 = calculate18YearsAgo();


    $scope.crea = function (form, user) {

        desactivaBoton();
        console.log('FORMULARIO');
        console.dir(form);
        console.dir(user);



        user.fechaNac = new Date();
        var dateString = document.getElementById("hiddenNac").value;
        var dateParts = dateString.split("/");
        user.fechaNac = new Date(+dateParts[2], dateParts[1] - 1, +dateParts[0]);

        console.log(user.fechaNac);
//        user.avatar= document.getElementById("idAvatar").value;
        user.nacionalidad = document.getElementsByName("country")[0].value;

        user.avatar = "/uploads/" + pathACList[0];
        var arrayBudget = slider2.noUiSlider.get();
        if (arrayBudget.length === 2) {
            user.budget_min = arrayBudget[0];
            user.budget_max = arrayBudget[1];
        }

        if (form.$invalid) {
            notificar('<i class="uk-icon-warning"></i>  Campos Faltantes', 'warning');
            activaBoton();
            return false;
        }
        if (hasWhiteSpace(user.nombreUsuario)) {
            notificar('<i class="uk-icon-warning"></i>  Nombre de usuario con caracteres inválidos', 'warning');
            activaBoton();
            return false;
        }
        if (user.password !== user.confirmaPassword) {
            notificar('<i class="uk-icon-warning"></i>  Las contraseñas no coinciden', 'warning');
            activaBoton();
            return false;
        }

        if (document.getElementById("hiddenNac").value === undefined || document.getElementById("hiddenNac").value === "") {
            notificar('<i class="uk-icon-warning"></i>  Debes ingresar su fecha de nacimiento manualmente', 'warning');
            activaBoton();
            return false;
        }
        if (user.descripcion === undefined || user.descripcion === "") {
            notificar('<i class="uk-icon-warning"></i>  Debes ingresar una descripción acerca de tí', 'warning');
            activaBoton();
            return false;
        }
        if (user.mensaje === undefined || user.mensaje === "") {
            notificar('<i class="uk-icon-warning"></i>  Debes ingresar un mensaje para los demás roomies', 'warning');
            activaBoton();
            return false;
        }
        if (listaCarac.length === 0) {
            notificar('<i class="uk-icon-warning"></i>  Debes elegir al menos un gusto o característica', 'warning');
            activaBoton();
            return false;
        }
        if (user.sexo === undefined || user.sexo === "") {
            notificar('<i class="uk-icon-warning"></i>  Debes elegir tu sexo', 'warning');
            activaBoton();
            return false;
        }
        if (pathACList[0] === undefined || pathACList[0] === "") {
            notificar('<i class="uk-icon-warning"></i>  Debes subir foto de perfil', 'warning');
            activaBoton();
            return false;
        }

        if (user.budget_min === undefined || user.budget_min === "" || user.budget_max === undefined || user.budget_max === "") {
            notificar('<i class="uk-icon-warning"></i>  Debes subir foto de perfil', 'warning');
            activaBoton();
            return false;
        }

        user.telefono = document.getElementById("phoneNumber").value;
        //user.pais = document.getElementsByName("country_phone")[0].value;

        if (user.telefono === undefined || user.telefono === "") {
            notificar('<i class="uk-icon-warning"></i>  Agregue su número de telefono', 'warning');
            activaBoton();
            return false;
        } else {
            var esValido = validaNumero();
            console.log(esValido);


            if (esValido === 'true') {
                console.log("es Valido?");
                var ccode = getCountryCode();
                user.telefono = "+" + ccode + document.getElementById("phoneNumber").value;

            } else {

                notificar('<i class="uk-icon-warning"></i>  Número de telefono inválido', 'warning');
                activaBoton();
                return false;

            }
        }



        console.log("NACION:  " + user.nacionalidad);
        console.log("Fecha Nacimiento " + document.getElementById("hiddenNac").value);
        console.log("AVATAR " + user.avatar);


        var characterList = [];

        for (var i = 0; i < listaCarac.length; i++) {
            var caracRoomie = new Object();
            caracRoomie.path = parseaPathCarac(listaCarac[i].children[0].src);
            caracRoomie.description = listaCarac[i].children[1].innerHTML.trim();

            characterList.push(caracRoomie);
        }

        console.dir(characterList);

        var jsonString = JSON.stringify(user);


        $http.post(CONSTANT.URLWSROOMIES, jsonString).
                then(function (response) {

                    console.info("AGREGA ROOMIE");
                    console.dir(response);

                    var objMongo = new Object();
                    var characterObjectList = [];
                    if (characterList.length > 0) {
                        characterList.forEach(function (element) {
                            var objPath = new Object();
                            objPath.path = element.path;
                            objPath.description = element.description;
                            characterObjectList.push(objPath);
                        });

                        objMongo.characteristics = characterObjectList;
                    }

                    objMongo.idUser = response.data;
                    objMongo.username = user.nombreUsuario;
                    objMongo.budget_min = user.budget_min;
                    objMongo.budget_max = user.budget_max;


                    $http.post('/api/user', objMongo)
                            .success(function (data) {

                                console.info("AGREGA USUARIO EN MONGO");
                                $location.path("/login");
                                notificar('<i class="uk-icon-thumbs-up"></i>  Registro exitoso', 'success');
                                notificar('<i class="uk-icon-warning"></i>  Revisar correo para activación', 'primary');

                                fbq('track', 'CompleteRegistration');

                                $scope.reset();


                            })
                            .error(function (data) {
                                console.log('Error MONGO: ' + data);
                                notificar('<i class="uk-icon-warning"></i>  Error al registrar M', 'danger');
                                activaBoton();
                            });



                }, function (error) {

                    $scope.reset();
                    console.info("-----------------------------------------");

                    console.dir(error);

                    if (error.status === 406) {
                        notificar('<i class="uk-icon-warning"></i>  Ya existe otra cuenta con el mismo nombre de usuario', 'danger');
                    }

                    if (error.status === 409) {
                        notificar('<i class="uk-icon-warning"></i>  Ya existe otra cuenta vinculada con el correo electrónico proporcionado', 'danger');
                    }

                    notificar('<i class="uk-icon-warning"></i>  Error al registrar', 'danger');
                    console.info(error);
                    activaBoton();
                });


    };

    $scope.disponibilidad = function (username) {

        $http.get('/api/users/' + username)
                .success(function (data) {

                    console.info("BUSCAR EN MONGO");

                    if (data.length > 0) {
                        notificar('<i class="uk-icon-warning"></i>  Username NO disponible, elija otro', 'danger');
                    } else {
                        notificar('<i class="uk-icon-thumbs-up"></i>  Username disponible', 'success');
                    }






                })
                .error(function (data) {
                    console.log('Error MONGO: ' + data);
                    notificar('<i class="uk-icon-warning"></i>  Error al buscar M', 'danger');
                });

    };

});





app.controller('complementRoomieCtrl', function ($scope, $http, $location, usuarioService, CONSTANT) {
    var pantalla = pantallaCarga();


    $scope.userSes = usuarioService.getSessionUser();
    if ($scope.userSes.idUsuario === undefined || $scope.userSes.tipoUsuario !== 3) {
        $location.path("/inicio");
        pantalla.finish();
    }



    var obj = new Object();
    $scope.master = {};


    $scope.nombreUsuarioTouched = false;
    $scope.passwordTouched = false;
    $scope.confirmaPasswordTouched = false;
    $scope.descripcionTouched = false;
    $scope.mensajeTouched = false;

    console.info("ENTRO Complementa ROOMIE");


    var userPromise = usuarioService.getUserDTO($scope.userSes.idUsuario);
    userPromise.then(function (result) {
        $scope.user = result.data;
        console.info("REGRESA DESDE SERVICIO Usuario::  ");
        console.dir(result.data);
        $scope.user.nombreUsuario = "";
    });


    pantalla.finish();





    $scope.reset = function () {
        //$scope.user = angular.copy($scope.master);

        $scope.nombreUsuarioTouched = false;
        $scope.passwordTouched = false;
        $scope.confirmaPasswordTouched = false;
        $scope.descripcionTouched = false;
        $scope.mensajeTouched = false;
    };


    $scope.fecha18 = calculate18YearsAgo();


    $scope.crea = function (form, user) {

        desactivaBoton();

        console.log('FORMULARIO');
        console.dir(form);
        console.dir(user);


//        user.idUsuario=$scope.userSes.idUsuario;
        user.fechaNac = new Date();
        var dateString = document.getElementById("hiddenNac").value;
        var dateParts = dateString.split("/");
        user.fechaNac = new Date(+dateParts[2], dateParts[1] - 1, +dateParts[0]);

        console.log(user.fechaNac);
//        user.avatar= document.getElementById("idAvatar").value;
        user.nacionalidad = document.getElementsByName("country")[0].value;

        user.avatar = "/uploads/" + pathACList[0];
        var arrayBudget = slider2.noUiSlider.get();
        if (arrayBudget.length === 2) {
            user.budget_min = arrayBudget[0];
            user.budget_max = arrayBudget[1];
        }

        if (form.$invalid) {
            notificar('<i class="uk-icon-warning"></i>  Campos Faltantes', 'warning');
            activaBoton();
            return false;
        }
        if (hasWhiteSpace(user.nombreUsuario)) {
            notificar('<i class="uk-icon-warning"></i>  Nombre de usuario con caracteres inválidos', 'warning');
            activaBoton();
            return false;
        }
        if (user.password !== user.confirmaPassword) {
            notificar('<i class="uk-icon-warning"></i>  Las contraseñas no coinciden', 'warning');
            activaBoton();
            return false;
        }

        if (document.getElementById("hiddenNac").value === undefined || document.getElementById("hiddenNac").value === "") {
            notificar('<i class="uk-icon-warning"></i>  Debes ingresar su fecha de nacimiento manualmente', 'warning');
            activaBoton();
            return false;
        }
        if (user.descripcion === undefined || user.descripcion === "") {
            notificar('<i class="uk-icon-warning"></i>  Debes ingresar una descripción acerca de tí', 'warning');
            activaBoton();
            return false;
        }
        if (user.mensaje === undefined || user.mensaje === "") {
            notificar('<i class="uk-icon-warning"></i>  Debes ingresar un mensaje para los demás roomies', 'warning');
            activaBoton();
            return false;
        }
        if (listaCarac.length === 0) {
            notificar('<i class="uk-icon-warning"></i>  Debes elegir al menos un gusto o característica', 'warning');
            activaBoton();
            return false;
        }
        if (user.sexo === undefined || user.sexo === "") {
            notificar('<i class="uk-icon-warning"></i>  Debes elegir tu sexo', 'warning');
            activaBoton();
            return false;
        }
        if (pathACList[0] === undefined || pathACList[0] === "") {
            notificar('<i class="uk-icon-warning"></i>  Debes subir foto de perfil', 'warning');
            activaBoton();
            return false;
        }

        if (user.budget_min === undefined || user.budget_min === "" || user.budget_max === undefined || user.budget_max === "") {
            notificar('<i class="uk-icon-warning"></i>  Debes subir foto de perfil', 'warning');
            activaBoton();
            return false;
        }




        console.log("NACION:  " + user.nacionalidad);
        console.log("Fecha Nacimiento " + document.getElementById("hiddenNac").value);
        console.log("AVATAR " + user.avatar);


        user.estatus = 1;
        var characterList = [];

        for (var i = 0; i < listaCarac.length; i++) {
            var caracRoomie = new Object();
            caracRoomie.path = parseaPathCarac(listaCarac[i].children[0].src);
            caracRoomie.description = listaCarac[i].children[1].innerHTML.trim();

            characterList.push(caracRoomie);
        }

        console.dir(characterList);

        var jsonString = JSON.stringify(user);


        $http.put(CONSTANT.URLWSROOMIESFB, jsonString).
                then(function (response) {

                    desactivaBoton();

                    console.info("Complementa ROOMIE");
                    console.dir(response);

                    var objMongo = new Object();
                    var characterObjectList = [];
                    if (characterList.length > 0) {
                        characterList.forEach(function (element) {
                            var objPath = new Object();
                            objPath.path = element.path;
                            objPath.description = element.description;
                            characterObjectList.push(objPath);
                        });

                        objMongo.characteristics = characterObjectList;
                    }

                    objMongo.idUser = response.data;
                    objMongo.username = user.nombreUsuario;
                    objMongo.budget_min = user.budget_min;
                    objMongo.budget_max = user.budget_max;


                    $http.post('/api/user', objMongo)
                            .success(function (data) {

                                console.info("AGREGA USUARIO EN MONGO");
                                $location.path("/perfil");
                                notificar('<i class="uk-icon-thumbs-up"></i>  Registro exitoso', 'success');
                                notificar('<i class="uk-icon-warning"></i>  Revisar correo para activación', 'primary');
                                fbq('track', 'CompleteRegistration');
                                $scope.reset();

                                window.localStorage.setItem("sesType", "N");


                            })
                            .error(function (data) {
                                console.log('Error MONGO: ' + data);
                                notificar('<i class="uk-icon-warning"></i>  Error al registrar M', 'danger');
                                activaBoton();
                            });



                }, function (error) {

                    $scope.reset();
                    console.info("-----------------------------------------");
                    notificar('<i class="uk-icon-warning"></i>  Error al registrar', 'danger');
                    console.info(error);
                    activaBoton();
                });


    };

    $scope.disponibilidad = function (username) {

        $http.get('/api/users/' + username)
                .success(function (data) {

                    console.info("BUSCAR EN MONGO");

                    if (data.length > 0) {
                        notificar('<i class="uk-icon-warning"></i>  Username NO disponible, elija otro', 'danger');
                    } else {
                        notificar('<i class="uk-icon-thumbs-up"></i>  Username disponible', 'success');
                    }






                })
                .error(function (data) {
                    console.log('Error MONGO: ' + data);
                    notificar('<i class="uk-icon-warning"></i>  Error al buscar M', 'danger');
                });

    };

});




app.controller('editRoomieCtrl', function ($scope, $http, $location, usuarioService, CONSTANT) {
    var pantalla = pantallaCarga();

    $scope.userSes = usuarioService.getSessionUser();
    if ($scope.userSes.idUsuario === undefined || $scope.userSes.tipoUsuario !== 3) {
        $location.path("/inicio");
        pantalla.finish();
    }

    var obj = new Object();
    $scope.master = {};

    $scope.nombreTouched = false;
    $scope.primerApellidoTouched = false;
    $scope.correoTouched = false;
    $scope.nombreUsuarioTouched = false;
    $scope.passwordTouched = false;
    $scope.confirmaPasswordTouched = false;
    $scope.descripcionTouched = false;
    $scope.mensajeTouched = false;

    console.info("ENTRO EDITAR ROOMIE");

    $scope.fecha18 = calculate18YearsAgo();

    pantalla.finish();

    $scope.userSes = usuarioService.getSessionUser();

    var userPromise = usuarioService.getUserDTO($scope.userSes.idUsuario);
    userPromise.then(function (result) {
        $scope.user = result.data;
        console.info("REGRESA DESDE SERVICIO Usuario::  ");
        console.dir(result.data);
    });

    $scope.reset = function () {

        $scope.nombreTouched = false;
        $scope.primerApellidoTouched = false;
        $scope.correoTouched = false;
        $scope.nombreUsuarioTouched = false;
        $scope.passwordTouched = false;
        $scope.confirmaPasswordTouched = false;
        $scope.descripcionTouched = false;
        $scope.mensajeTouched = false;
    };



    $scope.edit = function (form, user) {


        console.log('FORMULARIO');
        console.dir(form);
        console.dir(user);

        if ($scope.changeAvatar) {
            console.log("nuevo avatar: " + user.avatar);
            user.avatar = document.getElementById("idAvatar").value;
            if (user.avatar === undefined || user.avatar === "") {
                notificar('<i class="uk-icon-warning"></i>  Debes elegir un avatar', 'warning');
                return false;
            }
        }

        if (form.$invalid) {
            notificar('<i class="uk-icon-warning"></i>  Campos Faltantes', 'warning');
            return false;
        }

        if (user.descripcion === undefined || user.descripcion === "") {
            notificar('<i class="uk-icon-warning"></i>  Debes ingresar una descripción acerca de tí', 'warning');
            return false;
        }
        if (user.mensaje === undefined || user.mensaje === "") {
            notificar('<i class="uk-icon-warning"></i>  Debes ingresar un mensaje para los demás roomies', 'warning');
            return false;
        }

        if (user.sexo === undefined || user.sexo === "") {
            notificar('<i class="uk-icon-warning"></i>  Debes elegir tu sexo', 'warning');
            return false;
        }




        var jsonString = JSON.stringify(user);


        $http.put(CONSTANT.URLWSROOMIES, jsonString).
                then(function (response) {

                    console.info("Actualiza ROOMIE");

                    notificar('<i class="uk-icon-thumbs-up"></i>  Actualización exitosa', 'success');
                    $location.path("/perfil");
                    console.dir(response);


                }, function (error) {

                    console.info("-----------------------------------------");
                    notificar('<i class="uk-icon-warning"></i>  Error al actualizar', 'danger');
                    console.info(error);
                });


    }

});

app.controller('editRoomieCaracCtrl', function ($scope, $http, $location, usuarioService) {
    var pantalla = pantallaCarga();

    $scope.userSes = usuarioService.getSessionUser();
    if ($scope.userSes.idUsuario === undefined || $scope.userSes.tipoUsuario !== 3) {
        $location.path("/inicio");
        pantalla.finish();
    }

    $scope.master = {};

    //LLAMAR CON MONGO
    var userPromise = usuarioService.getUserCharac($scope.userSes.idUsuario);
    userPromise.then(function (result) {
        $scope.usuario = result.data;
        console.dir($scope.usuario);

        precargarCheckbox($scope.usuario.characteristics, "caracRClass");

    });


    console.info("ENTRO Editar Carac ROOMIES");
    pantalla.finish();


    $scope.edita = function (form, user) {

        desactivaBoton();

        var caracUsuario = getChosenCharacR();
        console.dir(caracUsuario);


        if (caracUsuario === undefined || caracUsuario.length === 0) {

            notificar('<i class="uk-icon-warning"></i>  Debe añadir al menos característica.', 'warning');
            activaBoton();
            return false;
        }


        var objMongo = new Object();

        objMongo.characteristics = caracUsuario;

        //PUT USER BY ID
        $http.put('/api/user/charac/' + $scope.usuario.id_user, objMongo)
                .success(function (data) {

                    console.info("UPDATE USER EN MONGO");
                    $location.path("/perfil");
                    notificar('<i class="uk-thumbs-up"></i>  Actualizar gustos exitoso', 'success');
                    $location.path("/perfil");

                })
                .error(function (data) {
                    console.log('Error MONGO: ' + data);
                    notificar('<i class="uk-icon-warning"></i>  Problema al actualizar gustos M', 'danger');
                    activaBoton();

                });




    }

});


app.controller('altaResponsableCtrl', function ($scope, $http, $location, $auth, usuarioService, CONSTANT) {
    var pantalla = pantallaCarga();
    var obj = new Object();
    $scope.master = {};

    $scope.nombreTouched = false;
    $scope.primerApellidoTouched = false;
    $scope.correoTouched = false;
    $scope.nombreUsuarioTouched = false;
    $scope.passwordTouched = false;
    $scope.confirmaPasswordTouched = false;


    console.info("ENTRO AGREGAR RESPONSABLE");

    pantalla.finish();

    $scope.reset = function () {
        //$scope.user = angular.copy($scope.master);
        $scope.nombreTouched = false;
        $scope.primerApellidoTouched = false;
        $scope.correoTouched = false;
        $scope.nombreUsuarioTouched = false;
        $scope.passwordTouched = false;
        $scope.confirmaPasswordTouched = false;
    };

    $scope.fecha18 = calculate18YearsAgo();


    $scope.crea = function (form, user) {

        desactivaBoton();

        console.log('FORMULARIO');
        console.dir(form);
        console.dir(user);




        if (form.$invalid) {
            notificar('<i class="uk-icon-warning"></i>  Campos Faltantes', 'warning');
            activaBoton();
            return false;
        }
        if (document.getElementById("hiddenNac").value === undefined || document.getElementById("hiddenNac").value === "") {
            notificar('<i class="uk-icon-warning"></i>  Debes ingresar su fecha de nacimiento manualmente', 'warning');
            activaBoton();
            return false;
        }
        if (hasWhiteSpace(user.nombreUsuario)) {
            notificar('<i class="uk-icon-warning"></i>  Nombre de usuario con caracteres inválidos', 'warning');
            activaBoton();
            return false;
        }
        if (user.password !== user.confirmaPassword) {
            notificar('<i class="uk-icon-warning"></i>  Password does not match', 'warning');
            activaBoton();
            return false;
        }
        if (pathACList[0] === "" || pathACList[0] === undefined) {
            notificar('<i class="uk-icon-warning"></i> Suba foto de perfil', 'warning');
            activaBoton();
            return false;
        }
        if (user.sexo === undefined || user.sexo === "") {
            notificar('<i class="uk-icon-warning"></i>  Debes elegir tu sexo', 'warning');
            activaBoton();
            return false;
        }
        if (listaCarac.length === 0) {
            notificar('<i class="uk-icon-warning"></i>  Debes elegir al menos un gusto o característica', 'warning');
            activaBoton();
            return false;
        }


        user.telefono = document.getElementById("phoneNumber").value;
        //user.pais = document.getElementsByName("country_phone")[0].value;

        if (user.telefono === undefined || user.telefono === "") {
            notificar('<i class="uk-icon-warning"></i>  Agregue su número de telefono', 'warning');
            activaBoton();
            return false;
        } else {
            var esValido = validaNumero();
            console.log(esValido);


            if (esValido === 'true') {
                console.log("es Valido?");
                var ccode = getCountryCode();
                user.telefono = "+" + ccode + document.getElementById("phoneNumber").value;

            } else {

                notificar('<i class="uk-icon-warning"></i>  Número de telefono inválido', 'warning');
                activaBoton();
                return false;

            }
        }



        user.fechaNac = new Date();
        var dateString = document.getElementById("hiddenNac").value;
        var dateParts = dateString.split("/");
        user.fechaNac = new Date(+dateParts[2], dateParts[1] - 1, +dateParts[0]);

        user.nacionalidad = document.getElementsByName("country")[0].value;
        user.avatar = "/uploads/" + pathACList[0];
        console.log("Lista de imagenes:: " + pathACList);
        console.log("Portada " + pathACList[0]);


        console.log("NACION:  " + user.nacionalidad);
        console.log("Fecha Nacimiento " + document.getElementById("hiddenNac").value);


        var characterList = [];

        for (var i = 0; i < listaCarac.length; i++) {
            var caracRoomie = new Object();
            caracRoomie.path = parseaPathCarac(listaCarac[i].children[0].src);
            caracRoomie.description = listaCarac[i].children[1].innerHTML.trim();

            characterList.push(caracRoomie);
        }

        console.dir(characterList);


        var jsonString = JSON.stringify(user);


        $http.post(CONSTANT.URLWSSOCIOS, jsonString).
                then(function (response) {
                    console.info("AGREGA SOCIO");

                    var objMongo = new Object();

                    var characterObjectList = [];
                    if (characterList.length > 0) {
                        characterList.forEach(function (element) {
                            var objPath = new Object();
                            objPath.path = element.path;
                            objPath.description = element.description;
                            characterObjectList.push(objPath);
                        });

                        objMongo.characteristics = characterObjectList;
                    }


                    objMongo.idUser = response.data;
                    objMongo.username = user.nombreUsuario;



                    $http.post('/api/user', objMongo)
                            .success(function (data) {

                                console.info("AGREGA USUARIO EN MONGO");
                                notificar("¡Usuario Registrado exitosamente!", 'success');
                                fbq('track', 'CompleteRegistration');
                                //$location.path("/login");



                                $scope.loginAuto(user.nombreUsuario, user.password);
                                $scope.reset();


                            })
                            .error(function (data) {
                                console.log('Error MONGO: ' + data);
                                notificar('<i class="uk-icon-warning"></i>  Error al registrar M', 'danger');
                            });

                }, function (error) {



                    if (error.status === 406) {
                        notificar('<i class="uk-icon-warning"></i>  Ya existe otra cuenta con el mismo nombre de usuario', 'danger');
                    }

                    if (error.status === 409) {
                        notificar('<i class="uk-icon-warning"></i>  Ya existe otra cuenta vinculada con el correo electrónico proporcionado', 'danger');
                    }

                    notificar('<i class="uk-icon-warning"></i> ERROR: Registro usuario', 'danger');
                    console.info("-----------------SERVICIO---------------------");
                    console.info(error);

                    activaBoton();
                });


    }

    //REUSE
    $scope.loginAuto = function (us, pas) {


        console.log("NG MODEL " + us + " " + pas);

        $auth.login({
            data0: us,
            data1: pas,
            data2: "0",
            ftoken: 'cLORYUE7qyE:APA91bF0LJNGVOLam8hwJF6k1BFtdJlwxDKM3DBMtgfy_q38pKCRrw1SvgQtGSH2lYmhHn8_1bAxxRbIGCEtzP9lSpW1roMxDJ_P0s6D6pHRqeJpIAsmExgvn_Yr2VCAbSVBkq1HEY62'
        })
                .then(function (response) {
                    var pantalla = pantallaCarga();
                    // Si se ha logueado correctamente, lo tratamos aquí.
                    // Podemos también redirigirle a una ruta
                    console.log("LOGIN  EXITOSO");
                    console.log(response);
                    //$auth.setToken(response);
                    $auth.setToken(response.data.token.token);
                    console.log("TOKEN " + $auth.getToken());

                    var base64Url = $auth.getToken().split('.')[1];
                    var base64 = base64Url.replace('-', '+').replace('_', '/');

                    var jwtSes = JSON.parse(window.atob(base64));

                    console.log("RESULTADO  " + window.atob(base64));

                    window.sessionStorage.accessToken = jwtSes;
                    window.localStorage.setItem("sesType", "N");


                    notificar('¡Listo! Ya puedes comenzar a registrar tu vivienda', 'success');

                    $location.path("/altaVivienda");
                    pantalla.finish();
                })
                .catch(function (response) {
                    // Si ha habido errores llegamos a esta parte
                    console.log(response);
                    console.log("LOGIN  ERROR");
                    notificar('<i class="uk-icon-warning"></i>  Error al acceder', 'danger');

                });

    };

});

app.controller('editResponsableCtrl', function ($scope, $http, $location, usuarioService, CONSTANT) {
    var pantalla = pantallaCarga();

    $scope.userSes = usuarioService.getSessionUser();
    if ($scope.userSes.idUsuario === undefined || $scope.userSes.tipoUsuario !== 4) {
        $location.path("/inicio");
        pantalla.finish();
    }

    var obj = new Object();
    $scope.master = {};

    console.info("ENTRO EDITAR ROOMIE");

    pantalla.finish();

    var userPromise = usuarioService.getUserDTO($scope.userSes.idUsuario);
    userPromise.then(function (result) {
        $scope.user = result.data;
        console.info("REGRESA DESDE SERVICIO Usuario::  ");
        console.dir(result.data);
    });

    $scope.reset = function () {

        $scope.descripcionTouched = false;

    };



    $scope.edit = function (form, user) {


        console.log('FORMULARIO');
        console.dir(form);
        console.dir(user);


        if (form.$invalid) {
            notificar('<i class="uk-icon-warning"></i>  Campos Faltantes', 'warning');
            return false;
        }

        if (user.descripcion === undefined || user.descripcion === "") {
            notificar('<i class="uk-icon-warning"></i>  Debes ingresar una descripción acerca de tí', 'warning');
            return false;
        }


        var jsonString = JSON.stringify(user);


        $http.put(CONSTANT.URLWSSOCIOS, jsonString).
                then(function (response) {

                    console.info("Actualiza RESPONSABLE");
                    console.dir(response);
                    notificar("¡Usuario actualizado exitosamente!", 'success');
                    $location.path("/perfil");

                }, function (error) {

                    console.info("-----------------------------------------");
                    notificar('<i class="uk-icon-warning"></i>  Error al registrar', 'danger');
                    console.info(error);
                });


    }

});


app.controller('addClientCtrl', function ($scope, $http, $location, usuarioService, CONSTANT) {
    var pantalla = pantallaCarga();

    $scope.userSes = usuarioService.getSessionUser();
    if ($scope.userSes.idUsuario === undefined || $scope.userSes.tipoUsuario !== 4) {
        $location.path("/inicio");
        pantalla.finish();
    }

    var userCPromise = usuarioService.getUserCharac($scope.userSes.idUsuario);
    userCPromise.then(function (result) {

        if (result.data.client.length > 0) {

            if (result.data.client[0].activo) {

                $location.path("/inicio");
                pantalla.finish();

            } else {

                $scope.userC = result.data;


            }

        }

    });



    $scope.master = {};

    console.info("Añado cuenta");

    pantalla.finish();

    var userPromise = usuarioService.getUserDTO($scope.userSes.idUsuario);
    userPromise.then(function (result) {
        $scope.user = result.data;
        console.info("REGRESA DESDE SERVICIO Usuario::  ");
        console.dir(result.data);
    });



    $scope.reset = function () {

        $scope.clabe = "";

    };



    $scope.edit = function (form) {
        desactivaBoton();

        if (form.$invalid) {
            notificar('<i class="uk-icon-warning"></i>  Campos Faltantes', 'warning');
            activaBoton();
            return false;
        }

        if ($scope.clabe === undefined || $scope.clabe === "") {
            notificar('<i class="uk-icon-warning"></i>  Debes ingresar tu clabe interbancaria', 'warning');
            activaBoton();
            return false;
        }
        if ($scope.clabe.length !== 18) {
            notificar('<i class="uk-icon-warning"></i>  Clabe interbancaria inválida', 'warning');
            activaBoton();
            return false;
        }

        var cuenta = new Object();

        cuenta.id = $scope.userC.client[0].id;
        cuenta.clabe = $scope.clabe;
        cuenta.external_id = $scope.userSes.idUsuario;
//        var jsonString = JSON.stringify(client);

        $http.post('/openPayClientAcc', cuenta)
                .success(function (data) {
                    console.info("RESPUESTA OPENPAY FROM NODE");
                    console.dir(data);

                    var objMongo = new Object();
                    objMongo.clabe = $scope.clabe;
                    objMongo._id = $scope.userC.client[0]._id;

                    console.log('_ID client ' + objMongo._id);
                    //PUT USER BY ID
                    $http.put('/api/user/clientA/' + $scope.user.idUsuario, objMongo)
                            .success(function (data1) {

                                console.info("UPDATE USER EN MONGO");
                                $location.path("/perfil");
                                notificar('<i class="uk-thumbs-up"></i>  Activa pagos exitoso', 'success');


                            })
                            .error(function (data1) {
                                console.log('Error MONGO: ' + data1);
                                notificar('<i class="uk-icon-warning"></i>  Problema cliente M', 'danger');
                                activaBoton();

                            });


                })
                .error(function (data) {
                    console.log('Error SERVER OPENPAY: ');
                    console.dir(data);
                    notificar('<i class="uk-icon-warning"></i> OP ' + data.description, 'danger');
                    activaBoton();
                });


    };



});



app.controller('consultarUsuarioCtrl', function ($scope, $http, $location, $route, usuarioService, CONSTANT) {

    var pantalla = pantallaCarga();
    $scope.aceptaterminos = false;


    $scope.userSes = usuarioService.getSessionUser();

    console.dir($scope.userSes);
    if ($scope.userSes.idUsuario === undefined) {
        $location.path("/inicio");
        pantalla.finish();
    }


    console.info("LLEGA PARAMETRO  " + $scope.userSes.idUsuario);
    pantalla.finish();



//    var dati= new Object();
//    $http.post('/pushFirebase', dati)
//                .success(function (data) {
//                    console.info("RESPUESTA FIREBASE FROM NODE");
//                    console.dir(data);
//
//
//
//                })
//                .error(function (data) {
//                    console.log('Error FIREBASE OPENPAY: ');
//                    console.dir(data);
//                });




    $http.get(CONSTANT.URLWSUSUARIOS + $scope.userSes.idUsuario).
            then(function (response) {
                $scope.usuario = response.data;
                console.info("CONSULTA UN REGISTRO USUARIO:::: " + response.data);

                if ($scope.usuario.avatar === null) {
                    console.info("AVATAR DEFAULT");
                    $scope.usuario.avatar = "images/users/foto.jpg";

                }

                $scope.usuario.edad = calcularEdad(response.data.fechaNac);

                if (!$scope.userSes.completo === false) {
                    $scope.usuario.completo = false;
                } else if ($scope.userSes.completo === undefined) {
                    $scope.usuario.completo = true;
                }


                //LLAMAR CON MONGO
                var userPromise = usuarioService.getUserCharac($scope.userSes.idUsuario);
                userPromise.then(function (result) {
                    $scope.user = result.data;
                    console.dir($scope.user);


                    if ($scope.user.rates !== undefined && $scope.user.rates.length > 0) {

                        $scope.promedio = (avgRate($scope.user.rates)).toFixed(2);
                        $scope.redondeado = Math.round($scope.promedio);
                    } else {

                        $scope.promedio = "S/N";
                        $scope.redondeado = "S/N";
                    }

                    console.log("CALIF:  " + $scope.redondeado);



                });

            }, function (error) {

                console.info("-----------------------------------------");
                console.info(error);
            }
            );


    $scope.leerNotificacion = function (idNoti) {

        usuarioService.leeNotificacion(idNoti);

        console.log("ID NOTI: ");
        console.log(idNoti);

    };



    $scope.aceptarTerminos = function (idNoti) {


        if ($scope.aceptaterminos === "acepto") {

            // $location.path("/creaCliente");
            var client = new Object();
            client.name = $scope.usuario.nombre;
            client.last_name = $scope.usuario.primerApellido;
            client.email = $scope.usuario.correoElectronico;
            client.external_id = $scope.usuario.idUsuario;
            //client.clabe = $scope.clabe;

//        var jsonString = JSON.stringify(client);

            $http.post('/openPayClient', client)
                    .success(function (data) {
                        console.info("RESPUESTA OPENPAY FROM NODE");
                        console.dir(data);

                        var objMongo = new Object();
                        var client = new Object();
                        //client.clabe = $scope.clabe;
                        client.id = data.id;

                        objMongo.client = client;

                        //PUT USER BY ID
                        $http.put('/api/user/client/' + $scope.usuario.idUsuario, objMongo)
                                .success(function (data1) {

                                    console.info("UPDATE USER EN MONGO");
                                    $location.path("/perfil");
                                    notificar('<i class="uk-thumbs-up"></i>  Activa pagos exitoso', 'success');
                                    $route.reload();


                                })
                                .error(function (data1) {
                                    console.log('Error MONGO: ' + data1);
                                    notificar('<i class="uk-icon-warning"></i>  Problema cliente M', 'danger');
                                    activaBoton();

                                });


                    })
                    .error(function (data) {
                        console.log('Error SERVER OPENPAY: ');
                        console.dir(data);
                        notificar('<i class="uk-icon-warning"></i> OP ' + data.description, 'danger');
                        activaBoton();
                    });






        } else {



            notificar('<i class="uk-icon-warning"></i>  Para activar cobros, necesita aceptar los terminos y condiciones', 'warning');




        }
    };

    $scope.irValidar = function () {

        console.log("validar");
        console.dir($scope.usuario);
        var objMongo = new Object();
        objMongo.idUser = $scope.userSes.idUsuario;
        objMongo.phone = $scope.usuario.telefono;


        $http.post('/phoneCode', objMongo)
                .success(function (data) {

                    console.dir(data);

                    notificar('<i class="uk-icon-phone"></i>  Se ha enviado un PIN a tu número telefónico', 'default');
                    $location.path("/validaNumero");


                })
                .error(function (data) {
                    console.log('Error PHONE: ');
                    notificar('<i class="uk-icon-phone"></i>  Hay un problema con el envío de PIN a tu telefono. Favor de verificar que sea válido', 'danger');
                    console.dir(data);

                });

    };


});





function parseaPathCarac(path) {

    var pieces = path.split("/");
    return pieces[pieces.length - 1];
}

function recargaBandera(codigo) {

    console.log("Recarga bandera " + codigo);
    var bandera = document.getElementsByClassName("bfh-countries");

    console.dir(bandera[0].childNodes[1].nodeValue);

    if (bandera[0].childNodes[1].nodeValue === " undefined") {
        document.getElementsByClassName("bfh-countries")[0].innerHTML = "<i class='glyphicon bfh-flag-" + codigo + "'></i>" + codigo;

    }
}


function calculate18YearsAgo() {
    var date18Ago;
    var today = new Date();

    var year18Ago = today.getFullYear() - 18;
    var month18Ago = today.getMonth() + 1;
    var day18Ago = today.getDate();
    console.log(today);
    console.log(month18Ago);

    if (day18Ago === 29 && month18Ago === 2) {

        day18Ago = 1;
        month18Ago = 3;
    }

    date18Ago = day18Ago + "/" + month18Ago + "/" + year18Ago;

    return date18Ago;
}

function hasWhiteSpace(s) {
    return s.indexOf(' ') >= 0;
}

function precargarCheckbox(listaObj, clase) {


    var listaClass = document.getElementsByClassName(clase);


    for (var i = 0; i < listaObj.length; i++) {

        for (var j = 0; j < listaClass.length; j++) {

            if (listaObj[i].path === listaClass[j].value) {
                document.getElementsByClassName(clase)[j].checked = true;
                break

            }
        }

    }

}

function getChosenCharacR() {

    var elementsCarac = document.getElementsByClassName("caracRClass");
    var caracRLabel = document.getElementsByClassName("caracRLabel");

    //console.log("Elementos en Clase carac vivienda "+elementsCarac.length);

    var caract = [];

    for (var i = 0; i < elementsCarac.length; i++) {
        if (elementsCarac[i].checked === true) {
            var obCarac = new Object();
            obCarac.path = elementsCarac[i].value;
            obCarac.description = caracRLabel[i].innerHTML;

            caract.push(obCarac);
        }
    }

    return caract;



}



function avgRate(rateList) {
    var suma = 0;


    for (var i = 0; i < rateList.length; i++) {

        suma = suma + rateList[i].stars;

    }

    var aver = suma / rateList.length;

    return aver;
}




function validaNumero() {


    console.log("VALIDA NUMERO");
    var isValid = "false";
    phoneNumberParser();

    var phoneSTR = document.getElementById("output").value;
    console.log(phoneSTR);

    var pos1 = phoneSTR.indexOf("isValidNumber(): ");
    console.log(pos1);
    isValid = phoneSTR.substring(pos1 + 17, pos1 + 22).replace(" ", "").replace("\n", "");
    console.log(isValid);

    return isValid;

}



function updateCountryPhone() {

    var pais = document.getElementsByName("country_phone")[0].value;
//    console.log("Update Country fone "+pais);
    document.getElementById("defaultCountry").value = pais;

}

function getCountryCode() {

    console.log("VALIDA NUMERO");
    var countryCode = "";
    phoneNumberParser();

    var phoneSTR = document.getElementById("output").value;
    console.log(phoneSTR);

    var pos1 = phoneSTR.indexOf('"country_code":');
    var pos2 = phoneSTR.indexOf(',"national_number":');

    countryCode = phoneSTR.substring(pos1 + 15, pos2).replace(" ", "").replace("\n", "");
    console.log(countryCode);

    return countryCode;

}