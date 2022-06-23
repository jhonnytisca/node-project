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
var Controller = require ('./cassController');

module.exports = function(app) {

        app.post('/cass/visit', Controller.registerVisit);
        
        app.post('/cass/device', Controller.registerDevice);
        app.get('/cass/device/:idUser', Controller.getDevicesByUser);
        app.put('/cass/device', Controller.addDevice);
      
};