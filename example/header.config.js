const { defineTmHeader } = require('../dist')

module.exports = defineTmHeader({
  name: 'Test script',
  namespace: 'com.script.Test',
  version: '0.0.1',
  author: 'noname',
  description: 'Test script',
  homepage: 'https://greasyfork.org/scripts/******',
  license: 'MIT',
  match: [
    'https://abc.com/qwe*',
    'https://asd.com/zxc*'
  ],
  supportURL: 'https://github.com',
  grant: [
    'GM_download'
  ],
  'require': 'https://lib.baomitu.com/arrive/2.4.1/arrive.min.js',
  'run-at': 'document-body'
})
