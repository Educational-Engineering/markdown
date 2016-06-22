import _ from 'underscore';
import cheerio from 'cheerio';
import MarkdownIt from 'markdown-it';
import MarkdownItAnchor from 'markdown-it-anchor';
import hljs from 'highlight';

import requirementPlugin from './remarkdown-et';


export class MarkdownParser {
  /**
   * Constructs the MarkdownParser
   * @class MarkdownPaser
   * @constructor
   */
  constructor() {
    this.picturePath = '/';
    this.reClass = /\{:((\s|\S)*?)\}/;
    this.reClassGlobal = /\{:((\s|\S)*?)\}/gm;
    this.reEmptyParagraph = /<p>\s*<\/p>/g;
  }
  /**
   * extract the classes in a string where the classes are
   * provided like: {: .class1 .class2}
   * @method extractClasses
   * @param {String} text The text where the classes are extracted
   * @return {String} a string containing all class names
   */
  extractClasses(text) {
    const classes = [];
    if (text.match(this.reClassGlobal).length > 1) {
      throw new Error('to much class identifiers');
    }

    const splitedClasses = text.match(this.reClass)[1].split(/[ ]+/);
    splitedClasses.forEach((element) => {
      const tempStr = element.trim();
      if (tempStr[0] === '.') {
        classes.push(tempStr.substring(1));
      } else {
        throw new Error('it must be a class!');
      }
    });
    return classes.join(' ');
  }

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
      return `${url}/${path}`;
    }
    return url + path;
  }

  /**
   * Cleans the markdown from empty paragraphs
   * @method cleanMarkdown
   * @param {String} input the markdown
   * @return {String} the cleaned markdown
   */
  cleanMarkdown(input) {
    const temp = input.replace(this.reClassGlobal, '');
    return temp.replace(this.reEmptyParagraph, '');
  }

  /**
   * Parses the classes
   * @method parseClasses
   * @param {String} html the html
   * @return {String} The html with added Classes
   */
  parseClasses(html) {
    const self = this;
    const re = this.reClass;
    const tree = cheerio(`<div>${html}</div>`);

    // find all occurences where the regex matches
    tree.find('*').filter(function filter() {
      return cheerio(this).first().contents()
        .filter(() => this.type === 'text')
        .text()
        .match(re);
    }).each((index, element) => {
      // add the classes to the parent
      cheerio(element).addClass(self.extractClasses(cheerio(element).first().contents()
        .filter(function findText() {
          return this.type === 'text';
        })
        .text()
      ));
    });

    return tree.html();
  }

  /**
   * Parses the markdown with the individual extensions. They are
   *  - @BEGIN and @END blocks are replaced by divs
   *  - {:.fsfd .fsfsd} are interpreted as classes
   * @method parseMarkdown
   * @param {String} input The markdown string
   * @return {String} The html string
   */
  parseMarkdown(input, postProcessing) {
    const md = new MarkdownIt({
      highlight(str, lang) {
        if (lang && hljs.getLanguage(lang)) {
          return hljs.highlight(lang, str).value;
        }
        return ''; // use external default escaping
      },
    });
    md.use(MarkdownItAnchor);
    md.use(requirementPlugin);
    let html = md.render(input);
    html = this.parseClasses(html);
    if (postProcessing) {
      html = postProcessing(html);
    }
    html = this.cleanMarkdown(html);
    return html;
  }
}
