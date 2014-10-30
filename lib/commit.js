'use strict';

var when = require('when');

function commit(client){

  function resolver(resolve, reject){
    client.query('COMMIT', function(err, result){
      if(err){
        reject(err);
      } else {
        resolve(result);
      }
    });
  }

  return when.promise(resolver);
}

module.exports = commit;
