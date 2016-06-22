import marked from 'marked';
import _ from 'underscore';
import cheerio  from 'cheerio';
import MarkdownIt from 'markdown-it';
import MarkdownItAnchor from 'markdown-it-anchor';
import requirementPlugin from "./remarkdown-et";


export class MarkdownParser {
  /**
   * Constructs the MarkdownParser
   * @class MarkdownPaser
   * @constructor
   */
  constructor() {
    this.picturePath = "/";
    this.reClass = /\{:((\s|\S)*?)\}/;
    this.reClassGlobal = /\{:((\s|\S)*?)\}/gm;
    this.reEmptyParagraph = /<p>\s*<\/p>/g;

    // Synchronous highlighting with highlight.js
    marked.setOptions({
      highlight: function (code, lang) {
        var high = null;
        if (lang) {
          high = hljs.highlightAuto(code, [lang]); // jshint ignore:line
        } else {
          high = hljs.highlightAuto(code); // jshint ignore:line
        }
        return high.value;
      }
    });

  }
  /**
   * extract the classes in a string where the classes are
   * provided like: {: .class1 .class2}
   * @method extractClasses
   * @param {String} text The text where the classes are extracted
   * @return {String} a string containing all class names
   */
  extractClasses(text) {
    var classes = [];
    if (text.match(this.reClassGlobal).length > 1) {
      throw new Error('to much class identifiers');
    }

    var splitedClasses = text.match(this.reClass)[1].split(/[ ]+/);
    splitedClasses.forEach(function (element) {
      var tempStr = element.trim();
      if (tempStr[0] === '.') {
        classes.push(tempStr.substring(1));
      } else {
        throw new Error("it must be a class!");
      }
    });
    return classes.join(" ");
  };

  /**
   * Generates the correct path
   * @method generatePath
   * @param {String} url The url
   * @param {String} path The path that should be appendet
   * @return {String} The combined url
   */
  generatePath(url, path) {
    if (path[0] === '/' && _.last(url) === '/') {
      return url + path.slice(1);
    } else if (path[0] !== '/' && _.last(url) !== '/') {
      return url + '/' + path;
    } else {
      return url + path;
    }
  };

  /**
   * Cleans the markdown from empty paragraphs
   * @method cleanMarkdown
   * @param {String} input the markdown
   * @return {String} the cleaned markdown
   */
  cleanMarkdown(input) {
    input = input.replace(this.reClassGlobal, "");
    return input.replace(this.reEmptyParagraph, '');
  };

  /**
   * Parses the classes
   * @method parseClasses
   * @param {String} html the html
   * @return {String} The html with added Classes
   */
  parseClasses(html) {
    var _this = this;
    var re = this.reClass;
    var tree = cheerio('<div>' + html + '</div>');

    //find all occurences where the regex matches
    tree.find('*').filter(function () {
      return cheerio(this).first().contents().filter(function() {
        return this.type === 'text';
      }).text().match(re);
    }).each(function (index, element) {
      //add the classes to the parent
      cheerio(element).addClass(_this.extractClasses(cheerio(element).first().contents().filter(function() {
          return this.type === 'text';
        }).text()
      ));
    });

    return tree.html();
  };

  /**
   * Parses the markdown with the individual extensions. They are
   *  - @BEGIN and @END blocks are replaced by divs
   *  - {:.fsfd .fsfsd} are interpreted as classes
   * @method parseMarkdown
   * @param {String} input The markdown string
   * @return {String} The html string
   */
  parseMarkdown (input, postProcessing) {
    // console.log("blibber");
    const md = new MarkdownIt();
    md.use(MarkdownItAnchor);
    md.use(requirementPlugin);
    let html = md.render(input);
    html = this.parseClasses(html);
    if(postProcessing) {
      html = postProcessing(html);
    }
    html = this.cleanMarkdown(html);
    return html;
  };
}
