/* 
 * Copyright (c) 2020 Carlos Cielo.
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v1.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-v10.html
 *
 * Contributors:
 *    Carlos Cielo - initial API and implementation and/or initial documentation
 */

var app = angular.module("rotwApp");

app.service('metaService', function () {
    var title = 'Roomies Of The World';
    var metaDescription = '';
    var metaUrl = '';
    var metaTitleT = '';
    var metaImage = '';

    return {
        set: function (newMetaDescription, newUrl, newTitleT, newImage) {
            metaUrl = newUrl;
            metaDescription = newMetaDescription;
            metaTitleT = newTitleT;
            metaImage = newImage;


        },
        metaTitle: function () {
            return title;
        },
        metaDescription: function () {
            return metaDescription;
        },
        metaTitleT: function () {
            return metaTitleT;
        },
        metaImage: function () {
            return metaImage;
        },
        metaUrl: function () {
            return metaUrl;
        }
    };
});
