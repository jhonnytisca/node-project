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

app.service('logService', function ($location, $http, usuarioService) {
var setVisita = function (CassObject) {
    
   console.log("LOG SERVICE");
    if (usuarioService.getSessionUser().idUsuario !== undefined) {
       CassObject.idUsuario =usuarioService.getSessionUser().idUsuario;
    }
    
    return $http.post("/cass/visit", CassObject)
           .success(function (data) {

        return data;
        }, function (error) {

        console.info("------------------ERROR SERVICIO CASS-----------------------");
                console.info(error);
                return error;
        });


};
        return {
        setVisita: setVisita

                };
            });
