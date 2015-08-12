exports.select = function (value, options) {
	var $el = $('<select />').html(options.fn(this));
	$el.find('[value="' + value + '"]').attr({ 'selected': 'selected' });
	return $el.html();
};

exports.if_eq = function (a, b, opts) {
	if (a == b) {
		return opts.fn(this);
	} else {
		return opts.inverse(this);
	}
};