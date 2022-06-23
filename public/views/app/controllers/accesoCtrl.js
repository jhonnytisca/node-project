/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

var app = angular.module("rotwApp");

app.controller('loginCtrl', function ($scope, $location, $auth, usuarioService) {
    console.log("LOGIN ENTRAR");

    var pantalla = pantallaCarga();
    pantalla.finish();


    $scope.login = function () {


        console.log("NG MODEL " + $scope.email + " " + $scope.password);

        $auth.login({
            data0: $scope.email,
            data1: $scope.password,
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

                    $location.path("/inicio");
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



app.controller('logoutCtrl', function ($scope, $location, $auth, $rootScope) {

    $scope.logout = function () {
        console.log("LOGOUT FUNCION");
        $auth.logout()
                .then(function () {
                    // Desconectamos al usuario y lo redirijimos
                    window.sessionStorage.accessToken = "";
                    window.localStorage.setItem("sesType", "");
                    window.localStorage.setItem("sesTokAux", "");
                    //$rootScope.notis = undefined;
                    $location.path("/login");
                });

    };
});


//FACEBOOK CONTROLLER
app.controller('facebookCtrl', function ($window) {
    console.log("FaceBook LOGIN");

    if (location.protocol == 'https:')
    {
        $window.fbAsyncInit = function () {
            console.log("INIT FACE");
            FB.init({
                appId: '110407259656579',
                status: true,
                cookie: true,
                xfbml: true,
                version: 'v6.0'
            });

            FB.AppEvents.logPageView();
        };

        (function (d) {
            // load the Facebook javascript SDK
            var js,
                    id = 'facebook-jssdk',
                    ref = d.getElementsByTagName('script')[0];

            if (d.getElementById(id)) {
                $window.fbAsyncInit();
                return;
            }
            js = d.createElement('script');
            js.id = id;
            js.async = true;
            js.src = "//connect.facebook.net/es_LA/sdk.js";
            ref.parentNode.insertBefore(js, ref);
        }(document));
    }
});

//FACEBOOK CONTROLLER
app.controller('vinculaFBCtrl', function ($http, $window, $location, facebookService, usuarioService, CONSTANT) {
    console.log("FaceBook VinculaFace");

    if (location.protocol == 'https:')
    {
        $window.fbAsyncInit = function () {
            console.log("INIT FACE");
            FB.init({
                appId: '110407259656579',
                status: true,
                cookie: true,
                xfbml: true,
                version: 'v6.0'
            });

            FB.AppEvents.logPageView();
        };

        (function (d) {
            // load the Facebook javascript SDK
            var js,
                    id = 'facebook-jssdk',
                    ref = d.getElementsByTagName('script')[0];

            if (d.getElementById(id)) {
                $window.fbAsyncInit();
                return;
            }
            js = d.createElement('script');
            js.id = id;
            js.async = true;
            js.src = "//connect.facebook.net/es_LA/sdk.js";
            ref.parentNode.insertBefore(js, ref);
        }(document));



    }

});


app.controller('vinculaFBSCtrl', function ($http, $scope, $location, facebookService, usuarioService, CONSTANT) {

    console.log("VINCULAR FB ENTRAR");

    $scope.userSes = usuarioService.getSessionUser();
    if ($scope.userSes.idUsuario === undefined) {
        $location.path("/inicio");
    }


    if (window.localStorage.getItem("sesType") === "F") {
        console.log("SESSION LINK FB");

        facebookService.getFBInfo()
                .then(function (response) {

                    console.log("FB desde servicio");
                    console.dir(response);
                    facebookService.getFBPicture(response.id)
                            .then(function (responsePic) {

                                console.log("FB Pic desde servicio");
                                console.dir(responsePic);


                                var userPromise = usuarioService.getUserDTO($scope.userSes.idUsuario);
                                userPromise.then(function (result) {
                                    $scope.user = result.data;
                                    console.info("REGRESA DESDE SERVICIO Usuario::  ");
                                    console.dir(result.data);


                                    $scope.user.perfilRed = response.id;
                                    $scope.user.correoRed = response.email;

                                    var jsonString = JSON.stringify($scope.user);

                                    console.log("PAYLOAD USER");
                                    console.dir(jsonString);

                                    $http.put(CONSTANT.URLWSROOMIES, jsonString).
                                            then(function (response) {

                                                console.info("Actualiza ROOMIE FB");

                                                console.dir(response);
                                                pantalla.finish();
                                                $location.path("/perfil");
                                                notificar('<i class="uk-icon-thumbs-up"></i>  Success linking FB', 'success');


                                            }, function (error) {

                                                console.info("-------------------ERROR----------------------");

                                                console.info(error);
                                                pantalla.finish();
                                                $location.path("/perfil");
                                                notificar('<i class="uk-icon-warning"></i>  Error al vincular FB', 'danger');

                                            });

                                });



                            }
                            );
                }
                );

    }

    $location.path("/perfil");





});


app.controller('headerCtrl', function ($scope, $window, usuarioService) {
    console.log("HEADER ENTRAR");
    $scope.notis = "";
    // $rootScopeProvider.digestTtl(5);

    //notificationPush();

    var i = 0;

    //Lector piks
    $scope.$watch(function () {
        console.log("WATCH");


        i = i + 1;
        console.log(i);
        //Max 13
        if (i >= 5) {
            i = 0;
        }
        if (i === 1) {

//            if (window.location.protocol === "http:") {
//            
//                $window.location.href = "https://www.roomiesoftheworld.com";
//            }
        }

        if (!usuarioService.getSessionUser()) {
            $scope.userSes = usuarioService.getSessionUser();
//            $scope.notis="";

        } else {
            $scope.userSes = usuarioService.getSessionUser();

            if ($scope.userSes.avatar === null) {
                $scope.userSes.avatar = "images/users/foto_thumbnail.png";
            }

            if (i === 1) {
                var userPromise = usuarioService.getUserNotis($scope.userSes.idUsuario);
                userPromise.then(function (result) {
                    //$scope.notis = result.data.notifications;

                    if (result.data === "false") {

                        $scope.notis = [];
                    } else {

                        $scope.notis = result.data;
                    }
                });



            }

        }
    }
    );


    $scope.leerNotificacion = function (idNoti) {

        usuarioService.leeNotificacion(idNoti);

        console.log("ID NOTI: ");
        console.log(idNoti);

    };


});


app.controller('sessionInterceptor', function ($http, $auth, $location, $scope, facebookService, usuarioService, CONSTANT) {
    console.log("SESSION INTERCEPTOR");
    if (window.localStorage.getItem("sesType") === "FTemp") {
        console.log("SESSION FB");




        facebookService.getFBInfo()
                .then(function (response) {

                    console.log("FB desde servicio");
                    console.dir(response);

                    facebookService.getFBPicture(response.id)
                            .then(function (responsePic) {

                                console.log("FB Pic desde servicio");
                                console.dir(responsePic);

                                var fbAccess = new Object();

                                fbAccess.id = response.id;
                                fbAccess.firstName = response.first_name;
                                fbAccess.lastName = response.last_name;
                                fbAccess.name = response.name;
                                fbAccess.email = response.email;



                                var jsonString = JSON.stringify(fbAccess);

                                console.dir(jsonString);



                                // INIT
                                var myPassword = '1234567890qwertyuiop:ROTW';


                                // Encrypt
                                var ciphertext = CryptoJS.AES.encrypt(jsonString, myPassword);

                                //var ciphertext = "U2FsdGVkX19JhF9xT/FzzJIO+qF/MDT8+1eqGQk/Eu64FbOMEHDgdRvLe7BuDf0dEAF+y00u4EdjizECZbCANF9cb4+HckCAEnN3scTggeYIUeGOZATV0FMdG/PRzFbnAaMBYdnyb/yM0AtRt2+a5Xfp1yYwp403b8KILVmnyr3LZwxbgMUTogUXf2YgLPDn"
                                // Decrypt
                                var bytes = CryptoJS.AES.decrypt(ciphertext.toString(), myPassword);
                                var decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
                                console.dir(ciphertext.toString());
                                console.dir(decryptedData);

//ciphertext
//jsonString
                                $http.post(CONSTANT.URLWSLOGINFACE, ciphertext.toString())
                                        .then(function (response) {

                                            if (response.status === 200) {
                                                console.log("RESPONSE LOGIN: " + response.data);
                                                if (!isNaN(response.data)) {



                                                    console.log("ES UN NUMERO");

                                                    var objectSes = new Object();
                                                    objectSes.nombreUsuario = fbAccess.id;
                                                    objectSes.idUsuario = response.data;
                                                    objectSes.avatar = responsePic.data.url;
                                                    objectSes.tipoUsuario = 3;
                                                    objectSes.completo = false;

                                                    //var jwtSes = JSON.parse(objectSes);
                                                    var jwtSes = JSON.stringify(objectSes);

                                                    window.sessionStorage.accessToken = jwtSes;
                                                    window.localStorage.setItem("sesType", "FIncom");
                                                    window.localStorage.setItem("sesTokAux", jwtSes);

                                                } else {
                                                    //else if(response.data.token!==undefined)

                                                    console.log("LOGIN  EXITOSO COMPLETO");
                                                    console.dir(response);

                                                    $auth.setToken(response.data.token);
                                                    console.log("TOKEN " + $auth.getToken());

                                                    var base64Url = $auth.getToken().split('.')[1];
                                                    var base64 = base64Url.replace('-', '+').replace('_', '/');

                                                    var jwtSes = JSON.parse(window.atob(base64));

                                                    console.log("RESULTADO TOKFB " + window.atob(base64));

                                                    window.sessionStorage.accessToken = jwtSes;
                                                    window.localStorage.setItem("sesType", "F");


                                                }
                                            }




                                        }, function (error) {

                                            console.info("----------------ERROR LOGIN FB-------------------------");
                                            notificar('<i class="uk-icon-warning"></i>  Error al LOGIN FB', 'danger');
                                            console.info(error);
                                        });

                            }
                            );
                }
                );

    }

    if (window.localStorage.getItem("sesType") === "FLink") {
        console.log("FLINK");


        facebookService.getFBInfo()
                .then(function (response) {

                    console.log("FB desde servicio");
                    console.dir(response);
                    facebookService.getFBPicture(response.id)
                            .then(function (responsePic) {

                                console.log("FB Pic desde servicio");
                                console.dir(responsePic);

                                $scope.userSes = usuarioService.getSessionUser();
                                var userPromise = usuarioService.getUserDTO($scope.userSes.idUsuario);
                                userPromise.then(function (result) {
                                    $scope.user = result.data;
                                    $scope.user.idFacebook = response.id;
                                    $scope.user.correoFacebook = response.email;
                                    console.info("REGRESA DESDE SERVICIO Usuario::  ");
                                    console.dir(result.data);
                                });




                                var jsonString = JSON.stringify($scope.user);


                                $http.put(CONSTANT.URLWSROOMIES, jsonString).
                                        then(function (response) {

                                            console.info("Actualiza ROOMIE FB");

                                            notificar('<i class="uk-icon-thumbs-up"></i>  Actualización exitosa', 'success');
                                            $location.path("/perfil");
                                            console.dir(response);
                                            window.localStorage.setItem("sesType", "F");


                                        }, function (error) {

                                            console.info("-----------------------------------------");
                                            notificar('<i class="uk-icon-warning"></i>  Error al actualizar', 'danger');
                                            console.info(error);
                                        });



                            }
                            );
                }
                );

    }
});

app.controller('counterCtrl', function ($scope, $http) {
    console.log("Counter ENTRAR");


    var objMongo = new Object();
    $http.get('/api/count/houses', objMongo)
            .success(function (data) {

                $scope.houseCount = data;

            })
            .error(function (data) {
                console.log('Error MONGO: ' + data);
            });


    $http.get('/api/count/users', objMongo)
            .success(function (data) {

                $scope.userCount = data;

            })
            .error(function (data) {
                console.log('Error MONGO: ' + data);
            });

    $http.get('/api/count/rooms', objMongo)
            .success(function (data) {

                var roomCount = 0;
                data.forEach(function (element) {

                    roomCount = roomCount + element.rooms.length;


                });

                $scope.roomCount = roomCount;

            })
            .error(function (data) {
                console.log('Error MONGO: ' + data);
            });

});




app.controller('sendEmailCtrl', function ($scope, $location, $http, usuarioService, CONSTANT) {

    var pantalla = pantallaCarga();
    pantalla.finish();

    $scope.send = function () {

        console.log("NG MODEL " + $scope.email);
        var paylo = new Object();
        // paylo.email = $scope.email;

        var jsonString = JSON.stringify(paylo);

        $http.post(CONSTANT.URLWSEMAILPW + $scope.email, jsonString).
                then(function (response) {

                    console.info("Correo enviado");
                    console.dir(response);
                    notificar('<i class="uk-icon-thumbs-up"></i>  Un correo ha sido enviado para resetear contraseña', 'success');
                    $location.path("/inicio");


                }, function (error) {

                    // $scope.reset();
                    console.info("-----------------------------------------");

                    console.dir(error);


                    notificar('<i class="uk-icon-warning"></i>  Error email', 'danger');
                    console.info(error);
                    activaBoton();
                });




    };
});



app.controller('resetPassCtrl', function ($scope, $http, $location, $routeParams, CONSTANT) {
    var pantalla = pantallaCarga();
    var obj = new Object();
    $scope.master = {};

    var codigo = "";
    if ($routeParams.code !== undefined) {
        codigo = $routeParams.code;
    }


    $scope.passwordTouched = false;


    console.info("ENTRO AGREGAR ROOMIE");

    pantalla.finish();

    $scope.reset = function () {

        $scope.passwordTouched = false;

    };

    if (codigo !== "") {
        var valid = new Object();
        var jsonStringV = JSON.stringify(valid);


        $http.post(CONSTANT.URLWVALID + codigo, jsonStringV).
                then(function (response) {

                    notificar('<i class="uk-icon-success"></i> Link válido', 'success');


                }, function (error) {

                    $scope.reset();
                    console.info("-----------------------------------------");
                    notificar('<i class="uk-icon-warning"></i>  Error al validar', 'danger');

                    console.info(error);
                    activaBoton();
                    $location.path("/inicio");
                });

    } else {

        notificar('<i class="uk-icon-warning"></i> Código no válido o expirado', 'warning');
        $location.path("/inicio");
    }



    $scope.enviar = function (form, user) {

        desactivaBoton();



        if (user.password !== user.confirmaPassword) {
            notificar('<i class="uk-icon-thumbs-up"></i>  Password no coincide con confirmación', 'error');
            activaBoton();
            return false;
        }


        if ($routeParams.code !== undefined) {
            codigo = $routeParams.code;
        }
        var updPw = new Object();

        updPw.url = codigo;
        updPw.passwordNueva = user.password;

        var jsonString = JSON.stringify(updPw);

        $http.put(CONSTANT.URLPWCHNG, jsonString).
                then(function (response) {

                    notificar('<i class="uk-icon-success"></i>  Password Reiniciada', 'success');
                    $location.path("/login");


                }, function (error) {

                    $scope.reset();
                    console.info("-----------------------------------------");
                    notificar('<i class="uk-icon-warning"></i>  Error al actualizar', 'danger');
                    console.info(error);
                    activaBoton();
                });


    };



});





function checkFBLoginState() {

    FB.getLoginStatus(function (response) {
        console.dir(response);
        if (response.status === 'connected') {
            console.log('Logged in.');
            window.sessionStorage.accessToken = response.authResponse.accessToken;
            window.localStorage.setItem("sesType", "FTemp");

            location.replace("/#/inicio");

        } else {
            FB.login(function (response) {

                console.dir(response);

            },
                    {scope: 'email,birthday,gender',
                        return_scopes: true}
            );
        }
    });




}


function checkFBLinkState() {

    FB.getLoginStatus(function (response) {
        console.dir(response);
        if (response.status === 'connected') {
            console.log('Logged in.');
            window.sessionStorage.accessToken = response.authResponse.accessToken;
            window.localStorage.setItem("sesType", "FLink");

            location.replace("/#/inicio");


        } else {
            FB.login(function (response) {

                console.dir(response);

            },
                    {scope: 'email',
                        return_scopes: true}
            );
        }
    });


}


function decrypt(encryptString) {

    var base64EncodedKeyFromJava = 'MTIzNDU2Nzg5MHF3ZXJ0eQ==';
    var keyForCryptoJS = CryptoJS.enc.Base64.parse(base64EncodedKeyFromJava);
    var decodeBase64 = CryptoJS.enc.Base64.parse(encryptString);
    var decryptedData = CryptoJS.AES.decrypt({ciphertext: decodeBase64}, keyForCryptoJS, {mode: CryptoJS.mode.ECB, padding: CryptoJS.pad.Pkcs7});
    var decryptedText = decryptedData.toString(CryptoJS.enc.Utf8);


    return decryptedText;
}





