module.exports = {
  root: true,
  // https://github.com/feross/standard/blob/master/RULES.md#javascript-standard-style
  extends: 'standard',
  // required to lint *.vue files
  plugins: [
    'html'
  ],
  // add your custom rules here
  'rules': {
    'no-extend-native': 0,
    // allow paren-less arrow functions
    'arrow-parens': 0,
    // allow debugger during development
    'no-debugger': process.env.NODE_ENV === 'production' ? 2 : 0
  },
  'globals': {
    'btoa': false,
    'fetch': false,
    'localStorage': false,
    'console': false,
    '$': false,
    'self': false,
    'clients': false,
    'reject': false,
    'resolve': false,
    // project
    'Notimatica': false,
    'registeredActions': false,
    'swfobject': false,
    'screen': false
  }
}
