

import { expect } from 'chai';

import { MarkdownParser } from '../../src/MarkdownParser';

describe('MarkdownParser', function () {
  var mdParser = new MarkdownParser();

  describe('Constructor', function () {
    it('Is the picturepath correct', function () {
      var temp = new MarkdownParser();
      expect(temp.picturePath).to.be.equal('/');
    });
  });

  describe('ExtractClasses', function () {
    it('To many class Identifiers.', function () {
      var text = "hello {:.blub} mist {:.hello}";
      var fn = function () {
        mdParser.extractClasses(text);
      };
      expect(fn).to.throw('to much class identifiers');
    });

    it('Not an class identifier.', function () {
      var text = "hello {:.blub mist}";
      var fn = function () {
        mdParser.extractClasses(text);
      };
      expect(fn).to.throw('it must be a class');
    });

    it('Extract class.', function () {
      var text = "hello {:.blub}";
      expect(mdParser.extractClasses(text)).to.be.equal('blub');
      text = "hello {:.blub .hello .meier}";
      expect(mdParser.extractClasses(text)).to.be.equal('blub hello meier');
      text = "hello {:.blub .hello.meier}";
      expect(mdParser.extractClasses(text)).to.be.equal('blub hello.meier');
    });
  });

  describe('generatePath', function () {
    it('Both with slash', function () {
      expect(mdParser.generatePath('hello/', '/mist')).to.be.equal('hello/mist');
    });
    it('None with slash', function () {
      expect(mdParser.generatePath('hello', 'mist')).to.be.equal('hello/mist');
    });

    it('One with slash', function () {
      expect(mdParser.generatePath('hello', '/mist')).to.be.equal('hello/mist');
      expect(mdParser.generatePath('hello/', 'mist')).to.be.equal('hello/mist');
    });
  });
  describe('CleanMarkdown', function () {
    it('Remove classes', function () {
      var html = '<div>{:.test .test} hello<span>mist{:.test}</span></div>';
      expect(mdParser.cleanMarkdown(html)).to.be.equal('<div> hello<span>mist</span></div>');
    });
    it('Remove empty paragraphs', function () {
      var html = 'test <p></p> test <p>test</p> blub <p> </p>';
      expect(mdParser.cleanMarkdown(html)).to.be.equal('test  test <p>test</p> blub ');
    });
  });

  describe('parseClasses', function () {
    it('Add classes', function () {
      var html = '<div>{:.test .test1} hello<span>mist{:.test}</span></div>';
      var resultat = '<div class="test test1">{:.test .test1} hello<span class="test">mist{:.test}</span></div>';
      expect(mdParser.parseClasses(html)).to.be.equal(resultat);
    });
    it('Add classes after child tag', function () {
      var html = '<div>hello<span>mist{:.test}</span>{:.test .test1}</div>';
      var resultat = '<div class="test test1">hello<span class="test">mist{:.test}</span>{:.test .test1}</div>';
      expect(mdParser.parseClasses(html)).to.be.equal(resultat);
    });
  });

  describe('parseMarkdown', function () {
    it('Example1', function () {
      var html = 'Abschliessende Frage\n===================\n@BEGIN@{:.task}\nhier geht es immer weriter\n@END@\n_______';
      var resultat = '<h1 id="abschliessende-frage">Abschliessende Frage</h1>\n<div class="task">\nhier geht es immer weriter\n</div>\n<hr>\n';
      expect(mdParser.parseMarkdown(html)).to.be.equal(resultat);
    });
  });

});
