/**
 * Created by dsichau on 22.06.16.
 */

// file lib/remarkable-requirement-plugin.js

/*
 *
 * Parser rule
 *
 */
const regexReq = /@BEGIN@([\s\S]*)@END@/
const requirementRule = function(md, state, start /*, end */) {
  console.log(state);

  // the string of lines not parsed yet:
  const lastLines = state.src.substring(state.bMarks[state.line])
  // use of regex:
  const res = lastLines.match(regexReq)
  if (res == null) { // if there's no match
    return false
  }

  var nbLines = res[0].split('\n').length // the number of lines of the requirement block

  state.tokens.push({
    type: 'req_et_block_open',
    text: res[1],
    level: state.level
  });

  state.blkIndent = 4                                       // this text has a four space indent
  state.md.block.tokenize(state, start + 1, start + nbLines) // tokenize the requirement's text content
  state.blkIndent = 0                                       // reset

  state.tokens.push({
    type: 'req_et_block_close',
    level: state.level
  });

  state.line = start + nbLines;
  return true
};

/*
 *
 * Renderers
 *
 */
const rendererOpen = function(tokens, idx) {
  const tok = tokens[idx]
  return `<div>${tok.text}`;
};

const rendererClose = function(/* tokens, idx */) {
  return '</div>\n'
};


export default function remarkablePlugin(md) {

  md.block.ruler.before('paragraph',
    'requirement',
    requirementRule.bind(null, md),
    {alt: []})

  md.renderer.rules['req_et_block_open'] = rendererOpen
  md.renderer.rules['req_et_block_close'] = rendererClose

}
