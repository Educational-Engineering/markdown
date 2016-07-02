/**
 * Created by dsichau on 22.06.16.
 */

/* eslint no-param-reassign: "off" */

/*
 *
 * Parser rule
 *
 */

const regexQuiz = /@BEGIN@[ \t]?\{:(.*\.quiz.*)\}[ \t]?[\r\n]([\s}\S]*)@END@/;
const regexEntry = /^[ \t]?- (.*)/;
const regexEntryLabel = /^[ \t]?- (.*)(?:\{:.*\})?/;
const regexCorrect = /\{:[ \t]?.correct[ \t]?}/;
const requirementRule = function requirementRule(md, state, start, endLine) {
  // the string of lines not parsed yet:
  const lastLines = state.src.substring(state.bMarks[state.line]);
  // use of regex:
  const res = lastLines.match(regexQuiz);
  if (res == null) { // if there's no match
    return false;
  }
  let classes = res[1].trim();
  classes = classes.split(' ');
  classes = classes.map((x) => x.replace(/^\.+/, ''));
  classes = classes.join(' ');

  const oldParent = state.parentType;
  const oldLineMax = state.lineMax;
  state.parentType = 'quiz';

  // const nbLines = res[2].split('\n').length; // the number of lines of the requirement block

  state.tokens.push({
    type: 'req_et_quiz_open',
    tag: 'div',
    classes,
    block: true,
    nesting: 1,
    level: state.level,
  });

  let nextLine = start;
  let tempStart = start + 1;
  for (;;) {
    nextLine++;
    if (nextLine >= endLine) {
      break;
    }
    const line = state.src.substring(state.bMarks[nextLine]);
    if (!regexEntry.test(line)) {
      continue;
    } else {
      state.md.block.tokenize(state, tempStart, nextLine - 1);
      tempStart = nextLine;
      state.tokens.push({
        type: 'req_et_quiz_item',
        level: state.level,
        content: line.split('\n')[0],
        nesting: -1,
      });
    }
  }


  state.tokens.push({
    type: 'req_et_quiz_close',
    level: state.level,
    block: true,
    nesting: -1,
  });
  state.parentType = oldParent;
  state.lineMax = oldLineMax;
  state.line = nextLine + 1;
  return true;
};

/*
 *
 * Renderers
 *
 */
const renderQuiz = function renderQuiz(tokens, idx) {
  const tok = tokens[idx];
  return `<div class="${tok.classes}">\n`;
};

const rendererClose = function rendererClose(options) {
  return `<div class="center"><button type="button" class="btn btn-quiz btn-default">
${options.buttonName}</button></div></div>\n`;
};

const renderQuizItem = function renderQuizItem(tokens, idx) {
  const tok = tokens[idx];
  const content = tok.content;
  const res = content.match(regexEntryLabel);
  if (res == null) { // if there's no match
    throw new Error('the quiz has an error');
  }
  let correct = false;
  const res2 = content.match(regexCorrect);
  if (res2) {
    correct = true;
  }
  return `<div><div class="checkbox"><label><input type="checkbox"
 data-value="${correct}">${res[1]}</label></div></div>\n`;
};

export default function remarkablePlugin(md, options) {
  md.block.ruler.before('et_block',
    'et_quiz',
    requirementRule.bind(null, md),
    { alt: [] });

  md.renderer.rules.req_et_quiz_open = renderQuiz;
  md.renderer.rules.req_et_quiz_item = renderQuizItem;
  md.renderer.rules.req_et_quiz_close = rendererClose.bind(null, options);
}

