import { expect } from 'chai';
import { describe, it } from 'mocha';


import { MarkdownParser } from '../../src/MarkdownParser';

describe('MarkdownParser', () => {
  const mdParser = new MarkdownParser();

  describe('Constructor', () => {
    it('Is the picturepath correct', () => {
      const temp = new MarkdownParser();
      expect(temp.picturePath).to.be.equal('/');
    });
  });

  describe('ExtractClasses', () => {
    it('To many class Identifiers.', () => {
      const text = 'hello {:.blub} mist {:.hello}';
      const fn = function fn() {
        mdParser.extractClasses(text);
      };
      expect(fn).to.throw('to much class identifiers');
    });

    it('Not an class identifier.', () => {
      const text = 'hello {:.blub mist}';
      const fn = function fn() {
        mdParser.extractClasses(text);
      };
      expect(fn).to.throw('it must be a class');
    });

    it('Extract class.', () => {
      let text = 'hello {:.blub}';
      expect(mdParser.extractClasses(text)).to.be.equal('blub');
      text = 'hello {:.blub .hello .meier}';
      expect(mdParser.extractClasses(text)).to.be.equal('blub hello meier');
      text = 'hello {:.blub .hello.meier}';
      expect(mdParser.extractClasses(text)).to.be.equal('blub hello.meier');
    });
  });

  describe('generatePath', () => {
    it('Both with slash', () => {
      expect(mdParser.generatePath('hello/', '/mist')).to.be.equal('hello/mist');
    });
    it('None with slash', () => {
      expect(mdParser.generatePath('hello', 'mist')).to.be.equal('hello/mist');
    });

    it('One with slash', () => {
      expect(mdParser.generatePath('hello', '/mist')).to.be.equal('hello/mist');
      expect(mdParser.generatePath('hello/', 'mist')).to.be.equal('hello/mist');
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

  describe('parseClasses', () => {
    it('Add classes', () => {
      const html = '<div>{:.test .test1} hello<span>mist{:.test}</span></div>';
      const resultat = '<div class="test test1">{:.test .test1} hello' +
        '<span class="test">mist{:.test}</span></div>';
      expect(mdParser.parseClasses(html)).to.be.equal(resultat);
    });
    it('Add classes after child tag', () => {
      const html = '<div>hello<span>mist{:.test}</span>{:.test .test1}</div>';
      const resultat = '<div class="test test1">hello' +
        '<span class="test">mist{:.test}</span>{:.test .test1}</div>';
      expect(mdParser.parseClasses(html)).to.be.equal(resultat);
    });
  });

  describe('parseMarkdown', () => {
    it('Example1', () => {
      const html = 'Abschliessende Frage\n===================\n' +
        '@BEGIN@{:.task}\nhier geht es immer weriter\n@END@\n_______';
      const resultat = '<h1 id="abschliessende-frage">Abschliessende Frage</h1>' +
        '\n<div class="task">\nhier geht es immer weriter\n</div>\n<hr>\n';
      expect(mdParser.parseMarkdown(html)).to.be.equal(resultat);
    });
  });
});
