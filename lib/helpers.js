'use strict';

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

exports.yell = function (msg) {
	return msg.toUpperCase();
};

exports.setChecked = function (value, currentValue) {
	if (value == currentValue) {
		return "checked"
	} else {
		return "";
	}
};

exports.getGravatarURL = function (user, size) {
	return user.gravatar(size);
};