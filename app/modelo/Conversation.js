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

var messageSchema = new Schema({
    id_sender : Number,
    content: String,
    seen: {type: Boolean, default: false},
    created_at: {type: Date, default: Date.now},
    updated_at: {type: Date, default: Date.now}
});
// create a schema
var conversationSchema = new Schema({
    id_participants: [Number],
    messages  : [messageSchema],
    created_at: {type: Date, default: Date.now},
    updated_at: {type: Date, default: Date.now}
});

// the schema is useless so far
// we need to create a model using it
var Conversation = mongoose.model('Conversation', conversationSchema);

// make this available to our users in our Node applications
module.exports = Conversation;

