var YamYam = require("YamYam");
module.exports = function(source, callback) {
  YamYam.parse(source, {
    format: {
      line: {
        tag: "",
        _prepend: " ",
        _prependStart: ""
      },
      codeContainer: {
        tag: "pre",
        "class": function(buffer, params, element) {
          if (element.language) {
            buffer.push("language-" + element.language.replace(/"/g, "&quot;"));
          }
        }
      },
      code: "",
      codeText: "",
      annotations: {
        "@attrs": YamYam.HtmlFormater.ATTRS
      }
    }
  }, function(err, html) {
    callback(err, html);
  });
}
