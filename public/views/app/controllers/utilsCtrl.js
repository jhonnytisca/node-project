/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


var app = angular.module("rotwApp");

app.controller('randomNumCtrl', function($scope) {

  $scope.num= Math.floor((Math.random() * 10) + 1);
  
});


app.controller('welcomeCtrl', function($scope) {

   var pantalla = pantallaCarga();
    
   
   //Teaser
  
  
   pantalla.finish();
});




app.controller('sugerenciasCtrl', function($http, $scope) {

        console.log("ENTRO A SUGERENCIAS");
          $http.get('/api/usersBy/'+27)
                    .success(function (data) {
                     console.log("Sugerencia");
                     console.dir(data);
                        
                    })
                    .error(function (data) {
                        console.log('Error MONGO: ' + data);
                    });
  
});



