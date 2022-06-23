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

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

//Hora correcta
//var localNow = new Date( record.date.getTime() -  ( record.offset * 60000 ) );

var notificationSchema = new Schema({
    id_sender: Number,
    content: String,
    link: String,
    seen: {type: Boolean, default: false},
    created_at: {type: Date, default: Date.now},
    updated_at: {type: Date, default: Date.now}
});

var characterSchema = new Schema({
    path: String,
    id_character: Number,
    description: String,
    created_at: {type: Date, default: Date.now},
    updated_at: {type: Date, default: Date.now}
});

var ratesSchema = new Schema({
    id_comment: Number,
    id_user: Number,
    avatar: String,
    username: String,
    content: String,
    stars: Number,
    created_at: {type: Date, default: Date.now},
    updated_at: {type: Date, default: Date.now}
});



var verificationSchema = new Schema({
    //PH, GO, FA
    type: String,
    //0 No iniciado; 1 Enviado; 2 Confirmado; 3 Rechazado; 
    status: {type: Number, default: 0},
    phone: String,
    pin: String,
    valido: {type: Boolean, default: false},
    valid_from: {type: Date, default: Date.now},
    valid_to: {type: Date, default: Date.now() + 24*60*60*1000},
    created_at: {type: Date, default: Date.now},
    updated_at: {type: Date, default: Date.now}
});




var clientSchema = new Schema({
    clabe: String,
    id: String,
    activo: {type: Boolean, default: false},
    created_at: {type: Date, default: Date.now},
    updated_at: {type: Date, default: Date.now}
});

// create a schema
var userSchema = new Schema({
    id_user: Number,
    username: String,
    budget_min: Number,
    budget_max: Number,
    client: {type: [clientSchema], validate: [arrayLimit1, '{PATH} exceeds the limit of 1']},
    characteristics: [characterSchema],
    notifications: [notificationSchema],
    rates: [ratesSchema],
    verification: [verificationSchema],
    created_at: {type: Date, default: Date.now},
    updated_at: {type: Date, default: Date.now}
});

// the schema is useless so far
// we need to create a model using it
var User = mongoose.model('User', userSchema);

// make this available to our users in our Node applications
module.exports = User;



function arrayLimit1(val) {
    return val.length <= 1;
}

