var xtend = require('util')._extend;

function nonEmptyString(s) { return s.length; }
function nonComment(s) { return s[0] !== '#'; }
function trim(s) { return s.replace(/^\s+|\s+$/g, ''); }

function parseProperties(s) {
  return s.split(/\r\n/)
    .map(trim)
    .filter(nonEmptyString)
    .filter(nonComment)
    .reduce(parseProperty, {});
}

function parseProperty(acc, s) {
  s = trim(s);
  var i = s.indexOf(' ');
  var p = s.substr(0, i);
  var v = trim(s.substr(i));
  acc[p] = v;
  return acc;
}

function parseHosts(s) {
  s = s.replace(/Host\s/, '');
  return s.split(/\s/)
    .map(trim)
    .filter(nonComment)
    .filter(nonEmptyString);
}

function wildcard(e) { return ~e.Host.indexOf('*'); }
function notWildcard(e) { return !wildcard(e); }

function parse(configString) {

  if (! configString)
    return [];

  var s = trim(configString);
  var hostLines = s.split(/\n\r\n/);
  var values = s
    .split(/^/)
    .map(trim)
    .filter(nonComment)
    .filter(nonEmptyString);
  var entries = [];
  values.forEach(function(value, i) {
	value = value.replace(/Host\s/g,",Host ");
	values[i] = value;
  });
  values = values[0].split(/,/);
  values.splice(0,1);
  values.forEach(function(hostLine, i) {
    var entry = parseProperties(values[i]);
    //parseHosts(hostLine).forEach(function(host) {
      entries.push(entry);
    //});
  });

  var wildcards = entries.filter(wildcard);
  entries = entries.filter(notWildcard);

  wildcards.forEach(function(entry) {
    var wildcard = entry.Host.replace('*', '');

    if (!~entry.Host.indexOf(wildcard))
      throw Error('Unsupported wildcard!');

    entries
      .filter(function(e) { return ~e.Host.indexOf(wildcard); })
      .forEach(function(e) {
        Object.keys(entry).forEach(function(key) {
          if (key === 'Host') return;
          if (typeof e[key] === 'string') return;
          e[key] = entry[key];
        });
      });
  });

  return entries;
}

module.exports = parse;
