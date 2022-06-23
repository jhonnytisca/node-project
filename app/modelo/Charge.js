/* 
 * Copyright (c) 2019 Carlos Cielo.
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

// create a schema

var addressSchema = new Schema({
    line1: String,
    line2: String,
    line3: String,
    state: String,
    city: String,
    postal_code: String,
    country_code: String
});



var cardSchema = new Schema({
    type: String,
    brand: String,
    card_number: String,
    holder_name: String,
    expiration_month: Number,
    expiration_year: Number,
    allows_charges: Boolean,
    allows_payouts: Boolean,
    creation_date: Date,
    bank_name: String,
    bank_code: String,
    address: [addressSchema]
});

var transactionSchema = new Schema({
    amount: Number,
    authorization: String,
    method: String,
    operation_type: String,
    transaction_type: String,
    status: String,
    id: String,
    creation_date: Date,
    description: String,
    error_message: String,
    order_id: String
});



// create a schema
var chargeSchema = new Schema({
    type: String,
    event_date: Date,
    p_status: {type: Number, default: 1},//1 not active 2 active 3 paid
    released_at: Date,   
    paid_at: Date,    
    transaction: [transactionSchema],
    card: [cardSchema],
    created_at: {type: Date, default: Date.now},
    updated_at: {type: Date, default: Date.now}
});

// the schema is useless so far
// we need to create a model using it
var Charge = mongoose.model('Charge', chargeSchema);

// make this available to our users in our Node applications
module.exports = Charge;