'use strict';

var when = require('when');

function rollback(client){

  function resolver(resolve, reject){
    client.query('ROLLBACK', function(err, result){
      if(err){
        reject(err);
      } else {
        resolve(result);
      }
    });
  }

  return when.promise(resolver);
}

module.exports = rollback;
