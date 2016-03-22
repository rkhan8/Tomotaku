var Simsimi = require('../');

var simsimi = new Simsimi({
	key: '0da76951-3f0d-49be-9be3-e014f658644b'
});

simsimi.listen('Hi', function(err, msg){
	if(err) return console.error(err);
	console.log('simsimi say:', msg);
});
