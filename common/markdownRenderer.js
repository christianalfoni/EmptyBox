var React = require('react');
var marked = require('marked');
var ent = require('ent');
var CodeComponent = React.createFactory(require('./CodeComponent.jsx'));
var renderer = new marked.Renderer();
var inlineIds = 0;
var keys = 0;
var inlines = {};
var result = [];

// Converts inline IDs to actual elements
var createBlockContent = function (content) {
  var textWithInlines = content.split(/(\{\{.*?\}\})/);
  content = textWithInlines.map(function (text) {
    var inline = text.match(/\{\{(.*)\}\}/);
    if (inline) {
      return inlines[inline[1]];
    } else {
      return ent.decode(text);
    }
  });
  return content;  
};

renderer.code = function (code, language) {
  result.push(CodeComponent({key: keys++, language: language, code: code}));
};

renderer.blockquote = function (text) {
  result.pop();
  result.push(React.createElement('blockquote', null,
    React.createElement('p', {key: keys++}, createBlockContent(text))
  ));
};

// How does this happen?
renderer.html = function (html) {
  return html;
};

renderer.heading = function (text, level) {
  var type = 'h' + level;
  result.push(React.createElement(type, {key: keys++}, createBlockContent(text)));
};

renderer.hr = function () {
  result.push(React.createElement('hr', {key: keys++}));
};

renderer.list = function (body, ordered) {
  result.push(React.createElement(ordered ? 'ol' : 'ul', {key: keys++}, createBlockContent(body)));
};

renderer.listitem = function (text) {
  var id = inlineIds++;
  inlines[id] = React.createElement('li', {key: keys++}, createBlockContent(text));
  return '{{' + id + '}}';  
};

renderer.paragraph = function (text) {
  var id = inlineIds++;
  inlines[id] = React.createElement('p', {key: keys++}, createBlockContent(text));
  result.push(inlines[id]);
  return '{{' + id + '}}';
};

renderer.table = function (header, body) {
  result.push(React.createElement('table', {key: keys++}, 
    createBlockContent(header),
    createBlockContent(body)
  ));
};

renderer.tablerow = function (content) {
  var id = inlineIds++;
  inlines[id] = React.createElement('tr', {key: keys++}, createBlockContent(content));
  return '{{' + id + '}}';   
};

renderer.tablecell = function (content, flags) {
  var id = inlineIds++;
  var props =  flags.align ? {className: 'text-' + flags.align} : {key: keys++};
  inlines[id] = React.createElement(flags.header ? 'th' : 'td', props, createBlockContent(content));
  return '{{' + id + '}}'; 
};

renderer.link = function (href, title, text) {
  var id = inlineIds++;
  inlines[id] = React.createElement('a', {
    href: href,
    title: title,
    key: keys++,
    target: 'new'
  }, ent.decode(text));
  return '{{' + id + '}}';
};

renderer.strong = function (text) {
  var id = inlineIds++;
  inlines[id] = React.createElement('strong', {key: keys++}, ent.decode(text));
  return '{{' + id + '}}'; 
};

renderer.em = function (text) {
  var id = inlineIds++;
  inlines[id] = React.createElement('em', {key: keys++}, ent.decode(text));
  return '{{' + id + '}}'; 
};

renderer.codespan = function (text) {
  var id = inlineIds++;
  inlines[id] = React.createElement('code', {key: keys++}, ent.decode(text));
  return '{{' + id + '}}'; 
};

renderer.br = function (text) {
  var id = inlineIds++;
  inlines[id] = React.createElement('br', {key: keys++}, ent.decode(text));
  return '{{' + id + '}}'; 
};

renderer.del = function (text) {
  var id = inlineIds++;
  inlines[id] = React.createElement('del', {key: keys++}, ent.decode(text));
  return '{{' + id + '}}'; 
};

renderer.image = function (href, title, text) {
  var id = inlineIds++;
  inlines[id] = React.createElement('img', {src: href, alt: title, key: keys++});
  return '{{' + id + '}}'; 
};


module.exports = function (content) {
  result = [];
  inlines = {};
  keys = 0;
  marked(content, {renderer: renderer, smartypants: true});
  return result;
};
