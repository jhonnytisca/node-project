var app = angular.module("rotwApp");

app.service('hexa', function() {
    this.myFunc = function (x) {
        return x.toString(16);
    }
});

app.service('cat', function($http, CONSTANT) {
    
    this.getTiposVivienda = function () {
        
        return $http.get(CONSTANT.URLWSTIPOSVIVIENDA).
        then(function(response) {
            return response;
            
        },function(error){
            return error;
        }
                );
    }
    
    this.getTipoCuarto = function () {
        
        return $http.get(CONSTANT.URLWSTIPOCUARTO).
        then(function(response) {
            return response;
            
        },function(error){
            return error;
        }
                );
    }
    
    
    this.getTipoServicio = function () {
        
        return $http.get(CONSTANT.URLWSTIPOSERVICIO).
        then(function(response) {
            return response;
            
        },function(error){
            return error;
        }
                );
    }
    
    
    
    
});
