var React = require('react');
var CodeComponent = require('./CodeComponent.jsx');
var marked = require('marked');
var renderer = new marked.Renderer();
var inlineIds = 0;
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
      return text;
    }
  });
  return content;  
};

renderer.code = function (code, language) {
  result.push(<CodeComponent language={language} code={code}/>);
};

renderer.blockquote = function (text) {
  result.pop();
  result.push(React.createElement('blockquote', null,
    React.createElement('p', null, createBlockContent(text))
  ));
};

// How does this happen?
renderer.html = function (html) {
  return html;
};

renderer.heading = function (text, level) {
  var type = 'h' + level;
  result.push(React.createElement(type, null, createBlockContent(text)));
};

renderer.hr = function () {
  result.push(React.createElement('hr'));
};

renderer.list = function (body, ordered) {
  result.push(React.createElement(ordered ? 'ol' : 'ul', null, createBlockContent(body)));
};

renderer.listitem = function (text) {
  var id = inlineIds++;
  inlines[id] = React.createElement('li', null, createBlockContent(text));
  return '{{' + id + '}}';  
};

renderer.paragraph = function (text) {
  var id = inlineIds++;
  inlines[id] = React.createElement('p', null, createBlockContent(text));
  result.push(inlines[id]);
  return '{{' + id + '}}';
};

renderer.table = function (header, body) {
  result.push(React.createElement('table', null, 
    createBlockContent(header),
    createBlockContent(body)
  ));
};

renderer.tablerow = function (content) {
  var id = inlineIds++;
  inlines[id] = React.createElement('tr', null, createBlockContent(content));
  return '{{' + id + '}}';   
};

renderer.tablecell = function (content, flags) {
  var id = inlineIds++;
  var props =  flags.align ? {className: 'text-' + flags.align} : null;
  inlines[id] = React.createElement(flags.header ? 'th' : 'td', props, createBlockContent(content));
  return '{{' + id + '}}'; 
};

renderer.link = function (href, title, text) {
  var id = inlineIds++;
  inlines[id] = React.createElement('a', {
    href: href,
    title: title
  }, text);
  return '{{' + id + '}}';
};

renderer.strong = function (text) {
  var id = inlineIds++;
  inlines[id] = React.createElement('strong', null, text);
  return '{{' + id + '}}'; 
};

renderer.em = function (text) {
  var id = inlineIds++;
  inlines[id] = React.createElement('em', null, text);
  return '{{' + id + '}}'; 
};

renderer.codespan = function (text) {
  var id = inlineIds++;
  inlines[id] = React.createElement('code', null, text);
  return '{{' + id + '}}'; 
};

renderer.br = function (text) {
  var id = inlineIds++;
  inlines[id] = React.createElement('br', null, text);
  return '{{' + id + '}}'; 
};

renderer.del = function (text) {
  var id = inlineIds++;
  inlines[id] = React.createElement('del', null, text);
  return '{{' + id + '}}'; 
};

renderer.image = function (href, title, text) {
  var id = inlineIds++;
  inlines[id] = React.createElement('img', {src: href, alt: title});
  return '{{' + id + '}}'; 
};

module.exports = React.createClass({
  render: function () {
    result = [];
    inlines = {};
    marked(this.props.content, {renderer: renderer, smartypants: true});
    return React.createElement('article', null,
      result
    );
  }
});
