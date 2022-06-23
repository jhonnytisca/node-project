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

// grab the things we need
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

//Hora correcta
//var localNow = new Date( record.date.getTime() -  ( record.offset * 60000 ) );


// create a schema
//var userSchema = new Schema({
//    name: String,
//    username: { type: String, required: true, unique: true },
//    password: { type: String, required: true },
//    admin: Boolean,
//    location: String,
//    meta: {
//      age: Number,
//      website: String
//    },
//    created_at: Date,
//    updated_at: Date
//});
//
//
//var Comments = new Schema({
//    title     : String
//  , body      : String
//  , date      : Date
//});
//
//var BlogPost = new Schema({
//    author    : ObjectId
//  , title     : String
//  , body      : String
//  , date      : Date
//  , comments  : [Comments]
//  , meta      : {
//        votes : Number
//      , favs  : Number
//    }
//});


////////////////
var livingSchema = new Schema({
    id_living: Number,
    id_room: Number,
    id_contract: Number,
    price: Number,
    status: Number,
    start_at: Date,
    months: Number,
    created_at: {type: Date, default: Date.now},
    updated_at: {type: Date, default: Date.now}

});

/*Status: 1-Aplicado, 2-Aceptado*/
var aspirantSchema = new Schema({
    id_aspirant: Number,
    id_room: Number,
    price: Number,
    status: Number,
    start_at: Date,
    months: Number,
    created_at: {type: Date, default: Date.now},
    updated_at: {type: Date, default: Date.now}
});

var extenantSchema = new Schema({
    id_extenant: Number,
    id_room: Number,
    id_contract: Number,
    price: Number,
    status: Number,
    start_at: Date,
    months: Number,
    end_at: {type: Date, default: Date.now},
    created_at: {type: Date, default: Date.now},
    updated_at: {type: Date, default: Date.now}
});

var commentsSchema = new Schema({
    id_comment: Number,
    id_user: Number,
    content: String,
    emoji: String,
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

var imagesSchema = new Schema({
    path: String,
    id_room: Number,
    created_at: {type: Date, default: Date.now},
    updated_at: {type: Date, default: Date.now}
});

var servicesSchema = new Schema({
    path: String,
    id_service: Number,
    description: String,
    created_at: {type: Date, default: Date.now},
    updated_at: {type: Date, default: Date.now}
});


var requirementsSchema = new Schema({
    path: String,
    id_requirement: Number,
    description: String,
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


var featuresSchema = new Schema({
    path: String,
    id_feature: Number,
    description: String,
    created_at: {type: Date, default: Date.now},
    updated_at: {type: Date, default: Date.now}
});


var furnitureSchema = new Schema({
    path: String,
    id_furniture: Number,
    description: String,
    created_at: {type: Date, default: Date.now},
    updated_at: {type: Date, default: Date.now}
});

var roomSchema = new Schema({
    id_room: Number,
    furniture: [furnitureSchema],
    images: [imagesSchema],
    rates: [ratesSchema],
    created_at: {type: Date, default: Date.now},
    updated_at: {type: Date, default: Date.now}
});



// create a schema
var houseSchema = new Schema({
    id_house: Number,
    available: Boolean,
    age_rate: String,
    is_roomie: Boolean,
    no_baths: Number,
    no_rooms: Number,
    min_months: Number,
    aspirants: [aspirantSchema],
    living: [livingSchema],
    extenant: [extenantSchema],
    rooms: [roomSchema],
    comments: [commentsSchema],
    rates: [ratesSchema],
    images: [imagesSchema],
    services: [servicesSchema],
    characteristics: [characterSchema],
    features: [featuresSchema],
    requirements: [requirementsSchema],
    created_at: {type: Date, default: Date.now},
    updated_at: {type: Date, default: Date.now}
});

// the schema is useless so far
// we need to create a model using it
var House = mongoose.model('House', houseSchema);

// make this available to our users in our Node applications
module.exports = House;