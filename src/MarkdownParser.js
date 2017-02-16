import MarkdownIt from 'markdown-it';
import MarkdownItAnchor from 'markdown-it-anchor';
import hljs from 'highlight.js';

import etPlugin from './remarkdown-et';
import quizPlugin from './remarkdown-et-quiz';
import codeboardPlugin from './remarkdown-codeboard';


export default class MarkdownParser {
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
   * @param {Object} options A Object with the elements quizButton and codeboardButton for the i18n for these buttons
   * @return {String} The html string
   */
  parseMarkdown(input, options) {
    const md = new MarkdownIt({
      highlight(str, lang) {
        if (lang && hljs.getLanguage(lang)) {
          return hljs.highlight(lang, str).value;
        }
        return hljs.highlightAuto(str).value;
      },
      html: true,
    });
    md.use(MarkdownItAnchor);
    md.use(etPlugin, {
      open: options.open,
      close: options.close,
    });
    md.use(quizPlugin, {
      buttonName: options.quizButton,
    });
    md.use(codeboardPlugin, {
      buttonName: options.codeboardButton,
    });
    md.renderer.rules.table_open = () => '<table class="table">';
    let html = md.render(input);
    html = this.cleanMarkdown(html);
    return html;
  }
}
