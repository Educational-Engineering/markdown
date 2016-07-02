import _ from 'underscore';
import MarkdownIt from 'markdown-it';
import MarkdownItAnchor from 'markdown-it-anchor';
import hljs from 'highlight';

import etPlugin from './remarkdown-et';
import quizPlugin from './remarkdown-et-quiz';
import codeboardPlugin from './remarkdown-codeboard';


export class MarkdownParser {
  /**
   * Constructs the MarkdownParser
   * @class MarkdownPaser
   * @constructor
   */
  constructor() {
    this.picturePath = '/';
    this.reClassGlobal = /\{:((\s|\S)*?)\}/gm;
    this.reEmptyParagraph = /<p>\s*<\/p>/g;
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
    md.use(etPlugin);
    md.use(quizPlugin, {
      buttonName: 'check',
    });
    md.use(codeboardPlugin, {
      buttonName: 'Open IDE',
    });
    let html = md.render(input);
    if (postProcessing) {
      html = postProcessing(html);
    }
    html = this.cleanMarkdown(html);
    return html;
  }
}
