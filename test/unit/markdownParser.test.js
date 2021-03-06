import { expect } from 'chai';
import { describe, it } from 'mocha';


import MarkdownParser from '../../src/MarkdownParser';

describe('MarkdownParser', () => {
  const mdParser = new MarkdownParser();

  const params = {
    open: 'open', close: 'close', quizButton: 'check', codeboardButton: 'open IDE',
  };
  describe('Constructor', () => {
    it('Is the picturepath correct', () => {
      const temp = new MarkdownParser();
      expect(temp.picturePath).to.be.equal('/');
    });
  });

  describe('CleanMarkdown', () => {
    it('Remove classes', () => {
      const html = '<div>{:.test .test} hello<span>mist{:.test}</span></div>';
      expect(mdParser.cleanMarkdown(html)).to.be.equal('<div> hello<span>mist</span></div>');
    });
    it('Remove empty paragraphs', () => {
      const html = 'test <p></p> test <p>test</p> blub <p> </p>';
      expect(mdParser.cleanMarkdown(html)).to.be.equal('test  test <p>test</p> blub ');
    });
  });

  describe('parseMarkdown', () => {
    it('Example1', () => {
      const html = 'Abschliessende Frage\n===================\n' +
        '@BEGIN@{:.task}\nhier geht es immer weriter\n@END@\n_______';
      const resultat = '<h1 id="abschliessende-frage">Abschliessende Frage</h1>' +
        '\n<div class="task">\n<p>hier geht es immer weriter</p>\n</div><hr>\n';
      expect(mdParser.parseMarkdown(html, params)).to.be.equal(resultat);
    });
    it('Example2', () => {
      const html = 'Abschliessende Frage\n===================\n' +
        '@BEGIN@ {: .task .blub}\n\nhier geht es immer weriter\n@END@\n_______';
      const resultat = '<h1 id="abschliessende-frage">Abschliessende Frage</h1>' +
        '\n<div class="task blub">\n<p>hier geht es immer weriter</p>\n</div><hr>\n';
      expect(mdParser.parseMarkdown(html, params)).to.be.equal(resultat);
    });
    it('Example3', () => {
      const html = '@BEGIN@ {: .task .blub}\n\n - hier\n - geht \n_______\n\n@END@\n';
      const resultat = '<div class="task blub">\n<ul>\n<li>hier</li>' +
        '\n<li>geht</li>\n</ul>\n<hr>\n</div>';
      expect(mdParser.parseMarkdown(html, params)).to.be.equal(resultat);
    });
    it('Collapse', () => {
      const html = '@BEGIN@ {: .task .collapse}\n\n - hier\n - geht \n_______\n\n@END@\n';
      const resultat = '<div class="collapse-outer"><div class="task collapse">\n<ul>\n<li>hier</li>' +
        '\n<li>geht</li>\n</ul>\n<hr>\n<div class="center"><button class="btn btn-close">close</button></div>' +
        '</div></div><div class="center"><button class="btn btn-open">open</button></div>';
      expect(mdParser.parseMarkdown(html, params)).to.be.equal(resultat);
    });
    it('Example4', () => {
      const html = '@BEGIN@ {: .task .blub}\n@BEGIN@{:.blub2}' +
        '\n - hier\n - geht \n@END@\n_______\n\n@END@\n';
      const resultat = '<div class="task blub">\n<div class="blub2">' +
        '\n<ul>\n<li>hier</li>\n<li>geht</li>\n</ul>\n</div><hr>\n</div>';
      expect(mdParser.parseMarkdown(html, params)).to.be.equal(resultat);
    });
  });
  describe('makeQuiz', () => {
    it('Parse Quiz 1', () => {
      const html = '@BEGIN@{:.quiz}\n - 1\n - 2{:.correct}\n@END@';
      const resultat = '<div class="quiz">\n<div><div class="checkbox"><label>' +
        '<input type="checkbox" data-value="false">1</label></div></div>\n<div>' +
        '<div class="checkbox"><label><input type="checkbox" data-value="true">' +
        '2</label></div></div>\n<div class="center"><button type="button"' +
        ' class="btn btn-quiz btn-default">check</button></div></div>\n';
      expect(mdParser.parseMarkdown(html, params)).to.be.equal(resultat);
    });
    it('Parse Quiz 2', () => {
      const html = '@BEGIN@{:.quiz}\n test **super**\n\n - 1\n - 2{:.correct}\n@END@';
      const resultat = '<div class="quiz">\n<p>test <strong>super</strong>' +
        '</p>\n<div><div class="checkbox"><label>' +
        '<input type="checkbox" data-value="false">1</label></div></div>\n<div>' +
        '<div class="checkbox"><label><input type="checkbox" data-value="true">' +
        '2</label></div></div>\n<div class="center"><button type="button"' +
        ' class="btn btn-quiz btn-default">check</button></div></div>\n';
      expect(mdParser.parseMarkdown(html, params)).to.be.equal(resultat);
    });
    it('Parse Quiz 3', () => {
      const html = '@BEGIN@{:.quiz}\n test **super**\n\n - 1\n - 2{:.correct}\n@END@\n' +
        '@BEGIN@{:.quiz}\n test2 **super**\n\n - 1\n - 2{:.correct}\n@END@';
      const resultat = '<div class="quiz">\n<p>test <strong>super</strong>' +
        '</p>\n<div><div class="checkbox"><label>' +
        '<input type="checkbox" data-value="false">1</label></div></div>\n<div>' +
        '<div class="checkbox"><label><input type="checkbox" data-value="true">' +
        '2</label></div></div>\n<div class="center"><button type="button"' +
        ' class="btn btn-quiz btn-default">check</button></div></div>\n' +
        '<div class="quiz">\n<p>test2 <strong>super</strong>' +
        '</p>\n<div><div class="checkbox"><label>' +
        '<input type="checkbox" data-value="false">1</label></div></div>\n<div>' +
        '<div class="checkbox"><label><input type="checkbox" data-value="true">' +
        '2</label></div></div>\n<div class="center"><button type="button"' +
        ' class="btn btn-quiz btn-default">check</button></div></div>\n';
      expect(mdParser.parseMarkdown(html, params)).to.be.equal(resultat);
    });
    it('Parse Quiz 4', () => {
      const html = '@BEGIN@{:.quiz}\n test **super**\n\n - 1 **test**\n - 2{:.correct}\n@END@';
      const resultat = '<div class="quiz">\n<p>test <strong>super</strong>' +
        '</p>\n<div><div class="checkbox"><label>' +
        '<input type="checkbox" data-value="false">1 <strong>test</strong></label></div></div>\n<div>' +
        '<div class="checkbox"><label><input type="checkbox" data-value="true">' +
        '2</label></div></div>\n<div class="center"><button type="button"' +
        ' class="btn btn-quiz btn-default">check</button></div></div>\n';
      expect(mdParser.parseMarkdown(html, params)).to.be.equal(resultat);
    });
  });

  describe('CodeMirror', () => {
    it('Render Button', () => {
      const html = '@CODEBOARD@{19870}';
      const result = '<div class="center"><a href="https://codeboard.io/projects/19870"\n' +
        'class="btn btn-default btn-codeboard"><img src="/gridfs/fs/hash/6022726bbfb3b9b97257939c1f21ad5f" alt="codeboard_logo_50.png">' +
        ' open IDE</a></div>';
      expect(mdParser.parseMarkdown(html, params)).to.be.equal(result);
    });
  });
});
