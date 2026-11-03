'use strict';
const main = document.querySelector('main');
const posts = [...window.ARCHIVE_POSTS].sort((a, b) => Number(b.id.replace(/^post/, '')) - Number(a.id.replace(/^post/, '')));
const escapeHTML = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'}[c]));
const link = post => `?post=${encodeURIComponent(post.id)}`;
const dateLabel = date => date.replaceAll('-', '.');
const meta = post => `<span>${escapeHTML(post.category)}</span><time datetime="${escapeHTML(post.date)}">${escapeHTML(dateLabel(post.date))}</time>`;

// Only emphasis is supported; all user text is escaped before HTML is generated.
const plainText = text => text.replace(/\*\*([^*]+)\*\*/g, '$1').replace(/\*([^*]+)\*/g, '$1');
const inlineText = text => escapeHTML(text).replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>').replace(/\*([^*]+)\*/g, '<em>$1</em>');
// Exclude whitespace and formatting markers. Count the body only.
const characterCount = body => Array.from(body.map(plainText).join('').replace(/\s/g, '')).length;

const renderBody = post => `<div class="prose">${post.body.map(p => /^\s*\*\s+\*\s+\*\s*$/.test(p) ? '<div class="scene-break" role="separator" aria-label="장면 구분"><span aria-hidden="true">*   *   *</span></div>' : `<p>${inlineText(p)}</p>`).join('')}</div><p class="character-count" title="제목·서식 기호·공백·줄바꿈 제외, 본문만 계산">공미포 ${characterCount(post.body).toLocaleString('ko-KR')}자</p>`;

function render() {
  const id = new URLSearchParams(location.search).get('post');
  if (id !== null) {
    const post = posts.find(p => p.id === id || p.legacyIds?.includes(id));
    if (!post) {
      document.title = '글을 찾을 수 없어요 | 문장 보관소';
      main.innerHTML = '<section class="intro"><p class="eyebrow">NOT FOUND</p><h1>글을 찾을 수 없어요.</h1><p>주소가 바뀌었거나 보관 중인 글일 수 있어요.</p><a class="back" href="?view=archive">모든 글로 돌아가기</a></section>';
      return;
    }
    if (id !== post.id) {
      const canonical = new URL(location.href);
      canonical.searchParams.set('post', post.id);
      history.replaceState(null, '', canonical);
    }
    document.title = `${post.title} | 문장 보관소`;
    document.querySelector('meta[name="description"]').content = post.adult ? '성인가능 글 · 요소 : BDSM' : post.excerpt;
    const index = posts.indexOf(post);
    const older = posts[index + 1];
    main.innerHTML = `<article class="article"><a class="back" href="?view=archive">← 모든 글</a><header class="article-header"><div class="meta">${meta(post)}</div><h1>${escapeHTML(post.title)}</h1>${(post.status || post.subcategories?.length) ? `<ul class="post-tags" aria-label="글 상태 및 서브 카테고리">${post.status ? `<li class="post-status">${escapeHTML(post.status)}</li>` : ''}${(post.subcategories || []).map(tag => `<li>${escapeHTML(tag)}</li>`).join('')}</ul>` : ''}</header>${post.adult ? `<section class="content-gate" aria-label="성인가능 글 안내"><div class="blur-preview" aria-hidden="true">${'<span></span>'.repeat(9)}</div><button type="button" class="reveal-button" id="reveal" aria-controls="post-content" aria-expanded="false"><strong>성인가능 글</strong><span>요소 : ${escapeHTML(post.elements)}</span><span class="reveal-hint">누르면 글이 보입니다</span></button></section>` : ''}<div id="post-content"${post.adult ? ' hidden' : ''}>${post.adult ? '' : renderBody(post)}</div>${post.authorNote ? `<aside class="author-note" aria-label="작가 메모">${escapeHTML(post.authorNote)}</aside>` : ''}<div class="article-actions"><a href="?view=archive">목록으로</a><button id="share" type="button">글 주소 복사</button></div>${older ? `<a class="next" href="${link(older)}"><span>이전 글</span><strong>${escapeHTML(older.title)}</strong><span aria-hidden="true">→</span></a>` : ''}</article>`;
    if (post.adult) {
      document.querySelector('#reveal').addEventListener('click', () => {
        const content = document.querySelector('#post-content');
        content.innerHTML = renderBody(post);
        content.hidden = false;
        document.querySelector('.content-gate').remove();
      }, {once: true});
    }
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
  const params = new URLSearchParams(location.search);
  if (params.get('view') !== 'archive') {
    document.title = '문장 보관소';
    main.innerHTML = '<section class="intro"><p>흩어지는 생각과 오래 간직하고 싶은 글을 모읍니다.</p><p>천천히 혹은 빠르게, 손이 움직이는 대로 써 내려가는 글입니다.</p><span class="signature">BBo</span></section>';
    return;
  }
  document.title = '모든 글 | 문장 보관소';
  const categories = [...new Set(posts.map(post => post.category))].sort();
  const selected = categories.includes(params.get('category')) ? params.get('category') : '';
  const visiblePosts = selected ? posts.filter(post => post.category === selected) : posts;
  const filters = [{label:'모두 보기',value:''}, ...categories.map(value => ({label:value,value}))];
  main.innerHTML = `<section class="archive archive-page" aria-labelledby="archive-title"><div class="section-heading"><h1 id="archive-title">보관한 글</h1><span>${String(visiblePosts.length).padStart(2,'0')}</span></div><nav class="category-tabs" aria-label="글 카테고리">${filters.map(filter => `<a href="?view=archive${filter.value ? '&amp;category='+encodeURIComponent(filter.value) : ''}"${selected === filter.value ? ' aria-current="page"' : ''}>${escapeHTML(filter.label)}</a>`).join('')}</nav><div class="post-list">${visiblePosts.length ? visiblePosts.map(p => `<a class="post" href="${link(p)}"><span class="post-number">${String(Number(p.id.replace(/^post/, ''))).padStart(2,'0')}</span><div class="post-content"><div class="meta">${meta(p)}</div><h3>${escapeHTML(p.title)}</h3></div><span class="post-arrow" aria-hidden="true">↗</span></a>`).join('') : '<p class="empty">아직 보관한 글이 없어요.</p>'}</div></section>`;
}
render();
