import './style.css'
import './test.less'
import { hello } from './hello'
import $ from 'jquery'

console.log('hello world main.ts: ' + hello())
console.log($.fn.jquery)
$.noop()

const hasOwnProperty = () => {
  console.log('for test')
}
hasOwnProperty()
