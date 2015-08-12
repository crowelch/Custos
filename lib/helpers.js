exports.select = function (value, options) {
	return options.fn(this)
    .split('\n')
    .map(function (v) {
		var t = 'value="' + value + '"'
		return !RegExp(t).test(v) ? v : v.replace(t, t + ' selected="selected"')
	})
    .join('\n')
};

exports.if_eq = function (a, b, opts) {
	if (a == b) {
		return opts.fn(this);
	} else {
		return opts.inverse(this);
	}
};