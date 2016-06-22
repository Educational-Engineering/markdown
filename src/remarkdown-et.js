/**
 * Created by dsichau on 22.06.16.
 */

/* eslint no-param-reassign: "off" */

/*
 *
 * Parser rule
 *
 */
const regexReq = /@BEGIN@([\s\S]*)@END@/;
const requirementRule = function requirementRule(md, state, start) {
  // the string of lines not parsed yet:
  const lastLines = state.src.substring(state.bMarks[state.line]);
  // use of regex:
  const res = lastLines.match(regexReq);
  if (res == null) { // if there's no match
    return false;
  }

  const nbLines = res[0].split('\n').length; // the number of lines of the requirement block

  state.tokens.push({
    type: 'req_et_block_open',
    text: res[1],
    level: state.level,
  });

  // this text has a four space indent
  state.blkIndent = 4;
  // tokenize the requirement's text content
  state.md.block.tokenize(state, start + 1, start + nbLines);
  // reset;
  state.blkIndent = 0;

  state.tokens.push({
    type: 'req_et_block_close',
    level: state.level,
  });

  state.line = start + nbLines;
  return true;
};

/*
 *
 * Renderers
 *
 */
const rendererOpen = function rendererOpen(tokens, idx) {
  const tok = tokens[idx];
  return `<div>${tok.text}`;
};

const rendererClose = function rendererClose() {
  return '</div>\n';
};


export default function remarkablePlugin(md) {
  md.block.ruler.before('paragraph',
    'requirement',
    requirementRule.bind(null, md),
    { alt: [] });

  md.renderer.rules.req_et_block_open = rendererOpen;
  md.renderer.rules.req_et_block_close = rendererClose;
}

