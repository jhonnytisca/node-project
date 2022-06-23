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
//var Persona = require('./modelo/persona');
var Controller = require ('./mongoController');

module.exports = function(app) {

	
	app.get('/api/persona', Controller.getPersona);
        
        app.get('/api/house/:id_house', Controller.getHousesById);
        
        app.get('/api/housesStr/:id_house_str', Controller.getHousesByStr);
        
        
        app.get('/api/myHome/:id_living', Controller.getMyHouse);
        
        
        app.get('/api/aspirant/house/:id_aspirant', Controller.getApplicationsByUser);
        
        app.get('/api/rooms/house/:id_room', Controller.getRoomById);
        
	app.post('/api/house', Controller.setHouse);
        
        app.put('/api/house/room/:id_house', Controller.addRoom);
        
        app.put('/api/house/:id_house', Controller.updateCaracHouse);
        
        app.put('/api/house/images/:id_house', Controller.updateImagesHouse);
	
        app.put('/api/house/aspirant/:id_house', Controller.addAspirant);
	
        app.put('/api/house/living/:id_house', Controller.addLiving);
        
        app.put('/api/house/living_m/:id_house', Controller.mudarRoomie);
        
        app.put('/api/house/living_k/:id_app', Controller.deliverKLiving);
        
        app.put('/api/house/extenant/:id_house', Controller.moveToExtenant);
        

        app.put('/api/house/furniture/:id_room', Controller.updateFurniture);
        
        
        
	app.put('/api/house/aspirant_r/:id_house', Controller.removeAspirant);
        
        app.put('/api/house/rate/:id_house', Controller.addRate);
        
        app.put('/api/house/aspirant_a/:id_app', Controller.acceptAspirant);
        
        
        app.get('/api/user/:idUser', Controller.getUserById);
        
        app.get('/api/users/:usernames', Controller.getUsersByUsernames);
        
        app.get('/api/usersBy/:idUsers', Controller.getUsersByIds);
        
        app.post('/api/user', Controller.setUser);
        
        app.put('/api/user/charac/:idUser', Controller.updateUserCharac);
        app.put('/api/user/client/:idUser', Controller.updateUserAddClient);
        app.put('/api/user/clientA/:idUser', Controller.updateClientActive);
       
       
        app.get('/api/user/noti/:idUser', Controller.getNotificationsByUser);
        app.put('/api/user/noti/:idUser', Controller.setNotification);
        app.put('/api/user/notiread', Controller.readNotification);
        
        app.put('/api/user/rate/:id_user', Controller.addRateRoomie);
       
        
        app.post('/api/conversation', Controller.setConversation);
        app.get('/api/conversation/:id_user', Controller.getConversationsByIdUser);
        app.put('/api/conversation/:id_conversation', Controller.addMessage);
        
        app.put('/api/phone/pin/:id_user', Controller.confirmPIN);
        
        
        app.get('/api/count/users', Controller.countUsers);
        app.get('/api/count/houses', Controller.countHouses);
        app.get('/api/count/rooms', Controller.countRooms);
        
        app.get('/api/all/houses', Controller.getAllHouses);
        
        app.get('/api/charge/:id_charge', Controller.getChargeById);
      
        app.get('/api/chargeR/:id_host', Controller.getChargeByHost);
      
        app.put('/api/c/p', Controller.chargePay);
        
        

	// application -------------------------------------------------------------
//	app.get('*', function(req, res) {
//		res.sendfile('./public/index.html'); // Carga única de la vista
//	});
};