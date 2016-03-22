'use strict';
const request = require('superagent');
/**
 * Simsimi class
 */
class Simsimi {
  static get STATUS(){
    return ({
    	OK					: 100,
    	BAD_REQUEST	: 400,
    	UNAUTHORIZED: 401,
    	NOT_FOUND		: 404,
    	SERVER_ERROR: 500
    });
  }
  constructor(options){
    this.options = Object.assign({
      lc: 'en',
      ft: '0.0',
      api: 'http://sandbox.api.simsimi.com/request.p'
    }, options);
  }
  /**
   * [listen description]
   * @param  {[type]} text     [description]
   * @param  {[type]} response [description]
   * @return {[type]}          [description]
   */
  listen(text, response){
    request
    .get(this.options.api)
    .query({
      text: text,
      lc  : this.options.lc,
      ft  : this.options.ft,
      key : this.options.key
    })
    .end(function(err, res){
      if(res.ok && res.body){
        res = res.body;
        if(res.result == Simsimi.STATUS.OK)
          return response(err, res.response, res);
      }
      response(err || res);
    });
  }
}

module.exports = Simsimi;
