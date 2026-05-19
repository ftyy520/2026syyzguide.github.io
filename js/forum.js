/* ============================================
   论坛与评论模块
   ============================================ */

const ForumModule = (() => {
    const API = CONFIG.API_BASE;

    // ===== 论坛帖子 =====
    function initForum() {
        const newPostBtn = $('#new-post-btn');
        const postFormContainer = $('#post-form-container');
        const cancelPost = $('#cancel-post');
        const submitPost = $('#submit-post');
        const backToForum = $('#back-to-forum');

        // 显示发帖表单
        newPostBtn.addEventListener('click', () => {
            postFormContainer.style.display = 'block';
            postFormContainer.scrollIntoView({ behavior: 'smooth' });
        });

        // 取消发帖
        cancelPost.addEventListener('click', () => {
            postFormContainer.style.display = 'none';
        });

        // 提交帖子
        submitPost.addEventListener('click', () => {
            submitNewPost();
        });

        // 返回论坛列表
        backToForum.addEventListener('click', () => {
            $('#post-detail').style.display = 'none';
            $('.posts-list').style.display = 'flex';
            $('.forum-filters').style.display = 'flex';
            $('#new-post-btn').style.display = 'inline-flex';
        });

        // 论坛筛选
        $$('.filter-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                $$('.filter-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                loadPosts(btn.dataset.filter);
            });
        });

        // 提交回复
        $('#submit-reply').addEventListener('click', () => {
            submitReply();
        });

        // 加载帖子
        loadPosts('all');
    }

    // 加载帖子列表
    async function loadPosts(category = 'all') {
        const postsList = $('#posts-list');
        postsList.innerHTML = '<div class="loading-placeholder"><div class="loading-spinner"></div><p>加载中...</p></div>';

        try {
            const response = await fetch(`${API}/api/posts?category=${category}`);
            const data = await response.json();

            if (!data.posts || data.posts.length === 0) {
                postsList.innerHTML = `
                    <div class="loading-placeholder">
                        <p style="font-size:40px;margin-bottom:16px;">💬</p>
                        <p>暂无帖子，成为第一个提问的人吧！</p>
                    </div>
                `;
                return;
            }

            postsList.innerHTML = data.posts.map(post => `
                <div class="post-card" data-post-id="${post.id}">
                    <div class="post-card-header">
                        <span class="post-card-avatar">${post.avatar}</span>
                        <span class="post-card-author">${escapeHtml(post.nickname)}</span>
                        <span class="post-card-time">${formatTime(post.created_at)}</span>
                    </div>
                    <div class="post-card-title">${escapeHtml(post.title)}</div>
                    <div class="post-card-preview">${escapeHtml(post.content)}</div>
                    <div class="post-card-footer">
                        <span class="post-card-tag">${getCategoryLabel(post.category)}</span>
                        <span class="post-card-replies">💬 ${post.reply_count || 0} 回复</span>
                    </div>
                </div>
            `).join('');

            // 绑定点击事件
            $$('.post-card').forEach(card => {
                card.addEventListener('click', () => {
                    openPost(card.dataset.postId);
                });
            });
        } catch (err) {
            postsList.innerHTML = `
                <div class="loading-placeholder">
                    <p>加载失败，请稍后重试</p>
                    <button class="btn btn-outline" onclick="ForumModule.loadPosts()">重新加载</button>
                </div>
            `;
        }
    }

    // 打开帖子详情
    async function openPost(postId) {
        const postDetail = $('#post-detail');
        const postsList = $('.posts-list');
        const filters = $('.forum-filters');
        
        postsList.style.display = 'none';
        filters.style.display = 'none';
        $('#new-post-btn').style.display = 'none';
        postDetail.style.display = 'block';
        postDetail.dataset.postId = postId;

        try {
            const response = await fetch(`${API}/api/posts/${postId}`);
            const data = await response.json();
            const post = data.post;

            $('#post-detail-content').innerHTML = `
                <h2 class="post-detail-title">${escapeHtml(post.title)}</h2>
                <div class="post-detail-meta">
                    <span style="font-size:24px;">${post.avatar}</span>
                    <span style="font-weight:500;">${escapeHtml(post.nickname)}</span>
                    <span style="color:var(--text-light);font-size:13px;">${formatTime(post.created_at)}</span>
                    <span class="post-card-tag">${getCategoryLabel(post.category)}</span>
                </div>
                <div class="post-detail-body">${escapeHtml(post.content).replace(/\n/g, '<br>')}</div>
            `;

            // 加载回复
            loadReplies(postId);
        } catch (err) {
            $('#post-detail-content').innerHTML = '<p>加载失败</p>';
        }

        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // 加载回复
    async function loadReplies(postId) {
        const repliesList = $('#replies-list');
        
        try {
            const response = await fetch(`${API}/api/posts/${postId}/replies`);
            const data = await response.json();

            if (!data.replies || data.replies.length === 0) {
                repliesList.innerHTML = '<div class="comment-placeholder"><p>暂无回复</p></div>';
                return;
            }

            repliesList.innerHTML = data.replies.map(reply => `
                <div class="comment-item">
                    <div class="comment-avatar">${reply.avatar}</div>
                    <div class="comment-body">
                        <div class="comment-meta">
                            <span class="comment-name">${escapeHtml(reply.nickname)}</span>
                            <span class="comment-time">${formatTime(reply.created_at)}</span>
                        </div>
                        <div class="comment-text">${escapeHtml(reply.content).replace(/\n/g, '<br>')}</div>
                    </div>
                </div>
            `).join('');
        } catch (err) {
            repliesList.innerHTML = '<div class="comment-placeholder"><p>加载失败</p></div>';
        }
    }

    // 提交新帖子
    async function submitNewPost() {
        const userInfo = getUserInfo('post');
        if (!userInfo) return;

        const title = $('#post-title').value.trim();
        const content = $('#post-content').value.trim();
        const category = $('#post-category').value;

        if (!title) {
            showToast('请输入标题', 'warning');
            return;
        }
        if (!content) {
            showToast('请输入内容', 'warning');
            return;
        }

        try {
            const response = await fetch(`${API}/api/posts`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...userInfo,
                    title,
                    content,
                    category
                })
            });

            const data = await response.json();
            if (data.success) {
                showToast('帖子已提交，等待审核通过后显示', 'success');
                $('#post-form-container').style.display = 'none';
                // 清空表单
                $('#post-title').value = '';
                $('#post-content').value = '';
            } else {
                showToast(data.error || '提交失败', 'error');
            }
        } catch (err) {
            showToast('网络错误，请稍后重试', 'error');
        }
    }

    // 提交回复
    async function submitReply() {
        const userInfo = getUserInfo('reply');
        if (!userInfo) return;

        const content = $('#reply-content').value.trim();
        const postId = $('#post-detail').dataset.postId;

        if (!content) {
            showToast('请输入回复内容', 'warning');
            return;
        }

        try {
            const response = await fetch(`${API}/api/posts/${postId}/replies`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...userInfo,
                    content
                })
            });

            const data = await response.json();
            if (data.success) {
                showToast('回复已提交，等待审核通过后显示', 'success');
                $('#reply-content').value = '';
            } else {
                showToast(data.error || '提交失败', 'error');
            }
        } catch (err) {
            showToast('网络错误，请稍后重试', 'error');
        }
    }

    // ===== 文章评论 =====
    function initComments() {
        $('#submit-comment').addEventListener('click', () => {
            submitComment();
        });
    }

    // 加载文章评论
    async function loadComments(articleId) {
        const commentsList = $('#comments-list');
        
        try {
            const response = await fetch(`${API}/api/comments?article_id=${articleId}`);
            const data = await response.json();

            if (!data.comments || data.comments.length === 0) {
                commentsList.innerHTML = '<div class="comment-placeholder"><p>暂无评论，快来发表第一条吧！</p></div>';
                return;
            }

            commentsList.innerHTML = data.comments.map(comment => `
                <div class="comment-item">
                    <div class="comment-avatar">${comment.avatar}</div>
                    <div class="comment-body">
                        <div class="comment-meta">
                            <span class="comment-name">${escapeHtml(comment.nickname)}</span>
                            <span class="comment-time">${formatTime(comment.created_at)}</span>
                        </div>
                        <div class="comment-text">${escapeHtml(comment.content).replace(/\n/g, '<br>')}</div>
                    </div>
                </div>
            `).join('');
        } catch (err) {
            commentsList.innerHTML = '<div class="comment-placeholder"><p>加载评论失败</p></div>';
        }
    }

    // 提交评论
    async function submitComment() {
        const userInfo = getUserInfo('comment');
        if (!userInfo) return;

        const content = $('#comment-content').value.trim();
        const articleId = $('#article-detail').dataset.articleId;

        if (!content) {
            showToast('请输入评论内容', 'warning');
            return;
        }

        try {
            const response = await fetch(`${API}/api/comments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...userInfo,
                    content,
                    article_id: articleId
                })
            });

            const data = await response.json();
            if (data.success) {
                showToast('评论已提交，等待审核通过后显示', 'success');
                $('#comment-content').value = '';
                $('#comment-char-count').textContent = '0';
            } else {
                showToast(data.error || '提交失败', 'error');
            }
        } catch (err) {
            showToast('网络错误，请稍后重试', 'error');
        }
    }

    // ===== 工具函数 =====
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    function formatTime(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now - date;

        if (diff < 60000) return '刚刚';
        if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`;
        if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`;
        if (diff < 604800000) return `${Math.floor(diff / 86400000)}天前`;
        
        return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
    }

    function getCategoryLabel(category) {
        const labels = {
            'general': '综合',
            'enrollment': '入学',
            'academic': '学术',
            'life': '生活',
            'other': '其他'
        };
        return labels[category] || '综合';
    }

    // 初始化
    document.addEventListener('DOMContentLoaded', () => {
        initForum();
        initComments();
    });

    return { loadPosts, loadComments, openPost };
})();

window.ForumModule = ForumModule;