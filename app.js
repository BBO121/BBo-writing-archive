'use strict';
const main = document.querySelector('main');
const posts = [...window.ARCHIVE_POSTS].sort((a, b) => b.date.localeCompare(a.date));
const escapeHTML = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'}[c]));
const link = post => `?post=${encodeURIComponent(post.id)}`;
const dateLabel = date => date.replaceAll('-', '.');
const meta = post => `<span>${escapeHTML(post.category)}</span><time datetime="${escapeHTML(post.date)}">${escapeHTML(dateLabel(post.date))}</time>`;

function render() {
  const id = new URLSearchParams(location.search).get('post');
  if (id !== null) {
    const post = posts.find(p => p.id === id);
    if (!post) {
      document.title = '글을 찾을 수 없어요 | 문장 보관소';
      main.innerHTML = '<section class="intro"><p class="eyebrow">NOT FOUND</p><h1>글을 찾을 수 없어요.</h1><p>주소가 바뀌었거나 보관 중인 글일 수 있어요.</p><a class="back" href="./">모든 글로 돌아가기</a></section>';
      return;
    }
    document.title = `${post.title} | 문장 보관소`;
    document.querySelector('meta[name="description"]').content = post.excerpt;
    const index = posts.indexOf(post);
    const older = posts[index + 1];
    main.innerHTML = `<article class="article"><a class="back" href="./">← 모든 글</a><header class="article-header"><div class="meta">${meta(post)}</div><h1>${escapeHTML(post.title)}</h1></header><div class="prose">${post.body.map(p => `<p>${escapeHTML(p)}</p>`).join('')}</div><div class="article-actions"><a href="./">목록으로</a><button id="share" type="button">글 주소 복사</button></div>${older ? `<a class="next" href="${link(older)}"><span>이전 글</span><strong>${escapeHTML(older.title)}</strong><span aria-hidden="true">→</span></a>` : ''}</article>`;
    document.querySelector('#share').addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(location.href);
        document.querySelector('#status').textContent = '글 주소를 복사했어요.';
      } catch {
        document.querySelector('#status').textContent = '주소창의 링크를 복사해서 공유해주세요.';
      }
      clearTimeout(window.statusTimer);
      window.statusTimer = setTimeout(() => { document.querySelector('#status').textContent = ''; }, 3500);
    });
    return;
  }
  main.innerHTML = `<section class="intro"><p class="eyebrow">A PLACE FOR WORDS</p><h1>마음에 머문 문장들.</h1><p>흩어지는 생각과 오래 간직하고 싶은 글을 모읍니다.<br>천천히 쓰고, 가끔 다시 펼쳐봅니다.</p><span class="signature">BBo</span></section><section class="archive" aria-labelledby="archive-title"><div class="section-heading"><h2 id="archive-title">보관한 글</h2><span>${String(posts.length).padStart(2, '0')}</span></div><div class="post-list">${posts.length ? posts.map((p, i) => `<a class="post" href="${link(p)}"><span class="post-number">${String(posts.length - i).padStart(2, '0')}</span><div class="post-content"><div class="meta">${meta(p)}</div><h3>${escapeHTML(p.title)}</h3><p>${escapeHTML(p.excerpt)}</p></div><span class="post-arrow" aria-hidden="true">↗</span></a>`).join('') : '<p class="empty">아직 보관한 글이 없어요.</p>'}</div><p class="endnote">문장과 문장 사이, 잠시 쉬어가세요.</p></section>`;
}
render();
