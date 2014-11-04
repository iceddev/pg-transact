'use strict';

var lab = exports.lab = require('lab').script();
var describe = lab.describe;
var it = lab.it;
var before = lab.before;
var beforeEach = lab.beforeEach;
var after = lab.after;
var afterEach = lab.afterEach;

var expect = require('code').expect;
var sinon = require('sinon');

var when = require('when');

var pgTransaction = require('../');

describe('pg-transaction', function(){

  var client;
  var cleanup;

  beforeEach(function(done){
    client = {
      query: function(sql, done){ done(); }
    };

    cleanup = sinon.spy();
    done();
  });

  it('will call the transaction method with the client and a callback', function(done){
    function transaction(client, cb){
      expect(client).to.equal(client);
      expect(cb).to.be.a.function();
      cb();
    }

    function success(){
      expect(cleanup.called).to.be.true();
      done();
    }

    function fail(err){
      done(err);
    }

    pgTransaction(client, transaction, cleanup).done(success, fail);
  });

  it('will wait for a returned promise to resolve instead of using the callback', function(done){
    var expected = 123;

    function transaction(){
      return when.resolve(expected);
    }

    function success(result){
      expect(result).to.equal(expected);
      expect(cleanup.called).to.be.true();
      done();
    }

    function fail(err){
      done(err);
    }

    pgTransaction(client, transaction, cleanup).done(success, fail);
  });

  it('will fail when an error is passed to callback', function(done){
    var expected = new Error('test');

    function transaction(client, cb){
      cb(expected);
    }

    function success(){
    }

    function fail(err){
      expect(err).to.equal(expected);
      expect(cleanup.called).to.be.true();
      done();
    }

    pgTransaction(client, transaction, cleanup).catch(fail).done();
  });

  it('will fail when a returned promise is rejected', function(done){
    var expected = new Error('test');

    function transaction(){
      return when.reject(expected);
    }

    function fail(err){
      expect(err).to.equal(expected);
      expect(cleanup.called).to.be.true();
      done();
    }

    pgTransaction(client, transaction, cleanup).catch(fail).done();
  });

  it('will fail when an error occurs in BEGIN query', function(done){
    var expected = new Error('test');

    client.query = function(sql, done){
      if(sql === 'BEGIN'){
        return done(expected);
      }

      done();
    };

    function transaction(){
      return when.reject(expected);
    }

    function fail(err){
      expect(err).to.equal(expected);
      expect(cleanup.called).to.be.true();
      done();
    }

    pgTransaction(client, transaction, cleanup).catch(fail).done();
  });

  it('will fail when an error occurs in COMMIT query', function(done){
    var expected = new Error('test');

    client.query = function(sql, done){
      if(sql === 'COMMIT'){
        return done(expected);
      }

      done();
    };

    function transaction(){
      return when.resolve('not expected');
    }

    function fail(err){
      expect(err).to.equal(expected);
      expect(cleanup.called).to.be.true();
      done();
    }

    pgTransaction(client, transaction, cleanup).catch(fail).done();
  });

  it('will fail when an error occurs in ROLLBACK query', function(done){
    var expected = new Error('test');

    client.query = function(sql, done){
      if(sql === 'COMMIT'){
        return done(new Error('not expected'));
      }

      if(sql === 'ROLLBACK'){
        return done(expected);
      }

      done();
    };

    function transaction(){
      return when.reject(expected);
    }

    function fail(err){
      expect(err).to.equal(expected);
      expect(cleanup.called).to.be.true();
      done();
    }

    pgTransaction(client, transaction, cleanup).catch(fail).done();
  });
});
