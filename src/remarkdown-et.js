/**
 * Created by dsichau on 22.06.16.
 */

/* eslint no-param-reassign: "off" */

/*
 *
 * Parser rule
 *
 */
const regexStart = /^@BEGIN@[ \t]?\{:(.*)\}/;
const regexEnd = /^@END@/;
const requirementRule = function requirementRule(md, state, start, endLine) {
  // the string of lines not parsed yet:
  const lastLines = state.src.substring(state.bMarks[state.line]);
  // use of regex:
  const res = lastLines.match(regexStart);
  if (res == null) { // if there's no match
    return false;
  }
  let classes = res[1].trim();
  classes = classes.split(' ');
  classes = classes.map((x) => x.replace(/^\.+/, ''));
  classes = classes.join(' ');

  const oldParent = state.parentType;
  const oldLineMax = state.lineMax;
  state.parentType = 'container';

  // const nbLines = res[2].split('\n').length; // the number of lines of the requirement block
  let nextLine = start;
  let level = 0;
  for (;;) {
    nextLine++;
    if (nextLine >= endLine) {
      break;
    }
    const line = state.src.substring(state.bMarks[nextLine]);
    if (regexStart.test(line)) {
      level++;
    }
    if (!regexEnd.test(line)) {
      continue;
    } else if (level > 0) {
      level--;
      continue;
    }
    break;
  }
  // this will prevent lazy continuations from ever going past our end marker
  state.lineMax = nextLine;

  state.tokens.push({
    type: 'req_et_block_open',
    tag: 'div',
    classes,
    block: true,
    nesting: 1,
    level: state.level,
  });

  state.md.block.tokenize(state, start + 1, nextLine);

  state.tokens.push({
    type: 'req_et_block_close',
    classes,
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
const rendererOpen = function rendererOpen(tokens, idx) {
  const tok = tokens[idx];
  if (tok.classes.includes('collapse')) {
    return `<div class="collapse-outer"><div class="${tok.classes}">\n`;
  }
  return `<div class="${tok.classes}">\n`;
};

const rendererClose = function rendererClose(options, tokens, idx) {
  const tok = tokens[idx];
  if (tok.classes.includes('collapse')) {
    return `<div class="center"><button class="btn btn-close">${options.close}</button></div></div></div><div class="center"><button class="btn btn-open">${options.open}</button></div>`;
  }
  return '</div>';
};


export default function remarkablePlugin(md, options) {
  md.block.ruler.before('paragraph',
    'et_block',
    requirementRule.bind(null, md),
    { alt: [] });

  md.renderer.rules.req_et_block_open = rendererOpen;
  md.renderer.rules.req_et_block_close = rendererClose.bind(null, options);
}

