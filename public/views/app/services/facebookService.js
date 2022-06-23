var app = angular.module("rotwApp");
//location,birthday,gender

app.factory('facebookService', function($q) {
    return {
        getFBInfo: function() {
            var deferred = $q.defer();
            FB.api('/me', {
                fields: 'name,first_name,last_name,email,birthday,gender'
            }, function(response) {
                if (!response || response.error) {
                    deferred.reject('Error occured');
                } else {
                    deferred.resolve(response);
                }
            });
            return deferred.promise;
        },
        
        getFBPicture: function(idFB) {
            var deferred = $q.defer();
            FB.api(
            '/'+idFB+'/picture',
            'GET',
            {"redirect":"false"},
            function(response) {
                if (!response || response.error) {
                    deferred.reject('Error PicFB occured');
                } else {
                    deferred.resolve(response);
                }
            }
          );
            return deferred.promise;
        }
    };
});
