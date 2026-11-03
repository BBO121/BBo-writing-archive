const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const source = fs.readFileSync('app.js', 'utf8');
function page(search, customPosts) {
  const elements = {main: {innerHTML: ''}, '#status': {textContent: ''}, '#share': {addEventListener() {}}, 'meta[name="description"]': {content: ''}};
  const context = {window: {}, URLSearchParams, location: {search}, document: {querySelector: key => elements[key]}, setTimeout, clearTimeout};
  vm.createContext(context);
  vm.runInContext(fs.readFileSync('posts.js', 'utf8'), context);
  if (customPosts) context.window.ARCHIVE_POSTS = customPosts;
  vm.runInContext(source, context);
  return {html: elements.main.innerHTML, posts: context.window.ARCHIVE_POSTS};
}
const home = page('');
assert.equal(new Set(home.posts.map(p => p.id)).size, home.posts.length);
assert.equal((home.html.match(/class="post"/g) || []).length, home.posts.length);
for (const post of home.posts) {
  const detail = page(`?post=${post.id}`);
  assert.ok(detail.html.includes(post.title));
  assert.ok(detail.html.includes(post.body[0]));
}
assert.ok(page('?post=missing').html.includes('글을 찾을 수 없어요'));
assert.ok(page('', []).html.includes('아직 보관한 글이 없어요'));
assert.ok(!page('', [{id:'test',title:'<script>alert(1)</script>',date:'2026-11-03',category:'기록',excerpt:'<img src=x>'}]).html.includes('<script>'));
console.log('Passed: list, every article, missing article, empty list, and HTML escaping.');
