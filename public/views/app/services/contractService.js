/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

var app = angular.module("rotwApp");

app.service('contractService', function($http, CONSTANT) {

  var genera = function(contrato){
      
       //var contrato = new Object();
       console.log("OBJETO A MANDAR");
       console.dir(contrato);
       var jsonString = JSON.stringify(contrato);

       return $http.post(CONSTANT.URLWSCONTRATO, jsonString).
        then(function(response) {
           
            return response.data;
            
        },function(error){
            
            console.info("----------------Error SERVICIO CONTRATOS----------------------");
            console.info(error);
            return error;
        }
                );
      
      
      
  };
  
  
  
  var getById = function(idContrato, esRoomie){
      
       return $http.get(CONSTANT.URLWSGETCHECKIN+"?esRoomie="+esRoomie+ idContrato).
        then(function(response) {
              
                      
            console.dir(response.data);
            return response.data;
            
        },function(error){
            
            console.info("----------------Error SERVICIO VIVIENDAS----------------------");
            console.info(error);
            return error;
        }
                );
  };
  
  return {
    genera: genera,
    getById: getById
  };

});
