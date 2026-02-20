module.exports = function sortable () {

	var list = this;

	this.add({
		sortOrder: { type: Number, index: true, hidden: true },
	});

	this.schema.pre('save', function () {
		var next
		new Promise((resolve, reject) => {
			next = (err, ...rest) => err ? reject(err) : resolve(...rest)
		})

		if (typeof this.sortOrder === 'number') {
			return next();
		}

		var item = this;

		var addLast = function (done) {
			list.model.findOne().sort('-sortOrder').then(max => {
				item.sortOrder = (max && max.sortOrder) ? max.sortOrder + 1 : 1;
				done();
			}).catch(done);
		};

		if (list.get('sortable') === 'unshift') {
			list.model.where('sortOrder')
				.setOptions({ multi: true })
				.update(
					{ $inc: { sortOrder: 1 } },
					function (err) {
						if (err) {
							console.log('err', err);
							return addLast(next);
						}
						item.sortOrder = 1;
						next();
					}
				);
		} else {
			addLast(next);
		}
	});

	this.schema.statics.reorderItems = function reorderItems (id, prevOrder, newOrder, cb) {

		prevOrder = parseFloat(prevOrder);
		newOrder = parseFloat(newOrder);

		var whichWay = (newOrder > prevOrder) ? -1 : 1;
		var gte = (newOrder > prevOrder) ? prevOrder + 1 : newOrder;
		var lte = (newOrder > prevOrder) ? newOrder : prevOrder - 1;
		return list.model
			.where('sortOrder')
			.gte(gte)
			.lte(lte)
			.setOptions({ multi: true })
			.update({ $inc: { sortOrder: whichWay } }, function (err) {
				if (err) {
					console.log('err', err);
				}
				list.model.findOneAndUpdate({ _id: id }, { sortOrder: newOrder }).then((result) => cb(null, result)).catch(cb);
			});
	};

};
