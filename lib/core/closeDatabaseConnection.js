var debug = require('debug')('keystone:core:closeDatabaseConnection');

module.exports = function closeDatabaseConnection (callback) {
	this.mongoose.disconnect().then(function () {
		debug('mongo connection closed');
		callback && callback();
	}).catch((err) => {
		debug('mongo connection close error');
		callback && callback(err);
	});
	return this;
};
