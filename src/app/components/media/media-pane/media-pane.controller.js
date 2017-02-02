function MediaPaneController($http, $window) {
    var ctrl = this;
    ctrl.$onInit = function () {
        ctrl.loadImages();
    };
    ctrl.loadImages = function () {
         /*$http.jsonp('https://www.reddit.com/r/gaming.json?limit=100&jsonp=JSON_CALLBACK').success(function(data) {
            // we're requesting 100 entries just to exaggerate the loading bar's progress
            // since this is just for an example, don't display all 100, just the first 5
            var posts = data.data.children.slice(0,5);
        });*/

        ctrl.images = [];
        for (var i = 0; i < 9; i++) {
            ctrl.images.push({url: 'https://unsplash.it/300/300?image=' + i});
        }
        /** 
        var request = {headers: {responseType: 'blob'}};
        $http.get('https://unsplash.it/200/300?image=0',request).then(function(data) {
            ctrl.image = $window.URL.createObjectURL(new Blob(data.data, {type: 'image/jpeg'}));
        });**/
    };
}

angular
    .module('components.media')
    .controller('MediaPaneController', MediaPaneController);