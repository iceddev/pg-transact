pg-transaction
==============

[![Build Status](https://travis-ci.org/iceddev/pg-transaction.svg?branch=master)](https://travis-ci.org/iceddev/pg-transaction)

A nicer API on node-postgres transactions

## Usage

```js
var pg = require('pg.js');

function transaction(client, cb){
  // everything in here is run as a transaction
  client.query('SELECT NOW() as when', function(err, result){
    if(err){
      // passing an error to the callback does a rollback on the transaction
      return cb(err);
    }

    // passing a `null` error and a result will resolve the transaction as the result
    cb(null, result);
  });
}

pg.connect(connectionString, function(err, client, done){
  if(err){
    throw err;
  }

  pgTransaction(client, transaction, done)
    .then(console.log, console.error);
});
```

It also will work with a returned promise:

```js
var pg = require('pg.js');

function transaction(client, cb){
  return new Promise(function(resolve, reject){
    client.query('SELECT NOW() as when', function(err, result){
      if(err){
        return reject(err);
      }

      resolve(result);
    });
  });
}

pg.connect(connectionString, function(err, client, done){
  if(err){
    throw err;
  }

  pgTransaction(client, transaction, done)
    .then(console.log, console.error);
});
```
