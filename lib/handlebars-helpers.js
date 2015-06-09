module.exports = function (handlebars) {
  handlebars.registerHelper('md', function(txt) {
    if (!txt) return
    return marked(txt)
  })

  handlebars.registerHelper('checked', function (currentValue) {
    return currentValue == true ? ' checked ' : ''
  })
}

