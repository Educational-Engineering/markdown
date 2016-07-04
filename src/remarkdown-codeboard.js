/**
 * Created by dsichau on 22.06.16.
 */

/* eslint no-param-reassign: "off" */

/*
 *
 * Parser rule
 *
 */
const regexStart = /^@CODEBOARD@[ \t]?\{(.*)\}/;
const requirementRule = function requirementRule(md, state, start) {
  // the string of lines not parsed yet:
  const lastLines = state.src.substring(state.bMarks[state.line]);
  // use of regex:
  const res = lastLines.match(regexStart);
  if (res == null) { // if there's no match
    return false;
  }
  state.tokens.push({
    type: 'req_et_codeboard',
    tag: 'div',
    codeboardId: res[1],
    block: false,
    nesting: 1,
    level: state.level,
  });
  state.line = start + 1;
  return true;
};

/*
 *
 * Renderers
 *
 */
const rendererCodeboard = function rendererCodeboard(options, tokens, idx) {
  const tok = tokens[idx];
  return `<div class="center"><a href="https://codeboard.io/projects/${tok.codeboardId}"
class="btn btn-default btn-codeboard"><img src="/gridfs/fs/hash/6022726bbfb3b9b97257939c1f21ad5f" alt="codeboard_logo_50.png"> ${options.buttonName}</a></div>`;
};

export default function remarkablePlugin(md, options) {
  md.block.ruler.before('paragraph',
    'et_codeboard',
    requirementRule.bind(null, md),
    { alt: [] });

  md.renderer.rules.req_et_codeboard = rendererCodeboard.bind(null, options);
}

