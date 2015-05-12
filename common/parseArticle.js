module.exports = function (file, content, isDraft) {

  var articleDetails = file.split('_');
  var year = articleDetails[0];
  var month = articleDetails[1];
  var date = articleDetails[2];
  var title = articleDetails[3].split('-').join(' ').split('.')[0];
  var description = content.split('\n').reduce(function (description, line) {
    if (!description && line.match(/^(?!\#).*/)) {
      description = line;
    }
    return description;
  }, '');
  return {
    year: Number(year),
    month: Number(month),
    date: Number(date),
    published: new Date(year, month - 1, date).getTime(),
    title: title,
    isDraft: !!isDraft,
    content: content,
    description: description,
    file: file,
    url: '/articles/' + file.replace('.md', '')
  };

};
