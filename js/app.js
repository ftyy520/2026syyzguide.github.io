/* ============================================
   校园新生指南 - 主逻辑
   ============================================ */

// ===== 配置 =====
const CONFIG = {
    // 修改为你的 Cloudflare Worker URL
    API_BASE: 'https://school-guide-api.你的子域名.workers.dev',
    STORAGE_PREFIX: 'school_guide_',
};

// ===== 工具函数 =====
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

function storage(key, value) {
    const fullKey = CONFIG.STORAGE_PREFIX + key;
    if (value === undefined) {
        return localStorage.getItem(fullKey);
    }
    if (value === null) {
        localStorage.removeItem(fullKey);
        return;
    }
    localStorage.setItem(fullKey, JSON.stringify(value));
}

function getStorage(key) {
    const val = storage(key);
    if (val) {
        try { return JSON.parse(val); } catch (e) { return val; }
    }
    return null;
}

// Toast 提示
function showToast(message, type = 'info') {
    const container = $('#toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icons = { success: '✓', error: '✗', warning: '⚠', info: 'ℹ' };
    toast.innerHTML = `<span>${icons[type] || 'ℹ'}</span><span>${message}</span>`;
    
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        setTimeout(() => toast.remove(), 300);
    }, 3500);
}

// ===== 页面切换 =====
function navigateTo(pageName) {
    // 隐藏所有页面
    $$('.page').forEach(page => page.classList.remove('active'));
    
    // 显示目标页面
    const targetPage = $(`#page-${pageName}`);
    if (targetPage) {
        targetPage.classList.add('active');
    }
    
    // 更新导航高亮
    $$('.nav-link').forEach(link => {
        link.classList.remove('active');
        if (link.dataset.page === pageName) {
            link.classList.add('active');
        }
    });
    
    // 关闭移动端菜单
    $('#nav-menu').classList.remove('active');
    $('#menu-toggle').classList.remove('active');
    
    // 滚动到顶部
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // 存储当前页面
    storage('current_page', pageName);
}

// ===== 初始化导航 =====
function initNavigation() {
    // 导航链接点击
    $$('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            navigateTo(link.dataset.page);
        });
    });

    // Logo 点击回首页
    $('.nav-logo').addEventListener('click', (e) => {
        e.preventDefault();
        navigateTo('home');
    });

    // 功能卡片导航
    $$('[data-navigate]').forEach(el => {
        el.addEventListener('click', () => {
            navigateTo(el.dataset.navigate);
        });
    });

    // 汉堡菜单
    $('#menu-toggle').addEventListener('click', () => {
        $('#menu-toggle').classList.toggle('active');
        $('#nav-menu').classList.toggle('active');
    });

    // 滚动时导航栏阴影
    window.addEventListener('scroll', () => {
        const navbar = $('#navbar');
        if (window.scrollY > 10) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // 恢复上次页面
    const lastPage = getStorage('current_page');
    if (lastPage) {
        navigateTo(lastPage);
    }
}

// ===== 欢迎弹窗 =====
function initWelcomeModal() {
    const modal = $('#welcome-modal');
    const dontShowAgain = $('#dont-show-again');
    const closeBtn = $('#modal-close-btn');
    const musicToggle = $('#modal-music-toggle');
    const musicSelect = $('#modal-music-select');

    // 检查是否需要显示
    const hideModal = getStorage('hide_welcome');
    if (!hideModal) {
        setTimeout(() => {
            modal.classList.add('active');
        }, 500);
    }

    // 音乐开关
    musicToggle.addEventListener('change', () => {
        musicSelect.style.display = musicToggle.checked ? 'block' : 'none';
    });

    // 关闭弹窗
    closeBtn.addEventListener('click', () => {
        modal.classList.remove('active');
        
        if (dontShowAgain.checked) {
            storage('hide_welcome', true);
        }

        // 如果选择了开启音乐
        if (musicToggle.checked) {
            const selectedMusic = $('#modal-music-choice').value;
            if (window.MusicPlayer) {
                window.MusicPlayer.play(selectedMusic);
            }
        }
    });

    // 点击背景关闭
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('active');
        }
    });

    // "更多"页面重新显示
    $('#show-welcome-again').addEventListener('click', () => {
        modal.classList.add('active');
    });
}

// ===== 校园指南文章 =====
const ARTICLES = {
    'enrollment-guide': {
        title: '📋 新生入学报到全流程',
        category: '入学报到',
        date: '2024-08-15',
        content: `
            <h1>📋 新生入学报到全流程</h1>
            <p>恭喜你成为我校的一员！以下是入学报到的详细流程，帮助你顺利完成报到。</p>
            
            <h2>一、报到前准备</h2>
            <ul>
                <li><strong>录取通知书</strong> - 请妥善保管，报到时需出示</li>
                <li><strong>身份证</strong> - 原件及复印件（正反面各3份）</li>
                <li><strong>户口迁移证</strong> - 如需迁户口</li>
                <li><strong>一寸/二寸照片</strong> - 各准备8张</li>
                <li><strong>高考准考证</strong> - 备用</li>
                <li><strong>团组织关系</strong> - 团员证及介绍信</li>
            </ul>

            <h2>二、报到当天流程</h2>
            <ol>
                <li>到达学校后，在校门口找到迎新接待点</li>
                <li>出示录取通知书，领取报到材料袋</li>
                <li>前往所在学院报到处，完成注册</li>
                <li>缴纳学费（如未提前网上缴费）</li>
                <li>领取宿舍钥匙，前往宿舍整理</li>
                <li>领取校园卡</li>
            </ol>

            <h2>三、注意事项</h2>
            <p>如有特殊情况无法按时报到，请提前联系招生办说明原因并申请延期。</p>
            <p><em>以上内容仅供参考，具体以学校官方通知为准。</em></p>
        `
    },
    'dormitory-guide': {
        title: '🏠 宿舍生活指南',
        category: '校园生活',
        date: '2024-08-16',
        content: `
            <h1>🏠 宿舍生活指南</h1>
            <p>宿舍是你在学校的"家"，了解这些信息能帮你更好地适应宿舍生活。</p>
            
            <h2>一、宿舍基本配置</h2>
            <ul>
                <li>床铺（上下铺/上床下桌）</li>
                <li>衣柜、书桌、椅子</li>
                <li>阳台（部分宿舍）</li>
                <li>独立卫生间/公共卫生间</li>
                <li>空调、风扇</li>
                <li>网络接口/WiFi覆盖</li>
            </ul>

            <h2>二、必带物品清单</h2>
            <ul>
                <li>床上用品：被子、枕头、床垫、床单</li>
                <li>洗漱用品：毛巾、牙刷、洗面奶、沐浴露</li>
                <li>衣架、收纳箱</li>
                <li>插排（注意功率限制）</li>
                <li>台灯（LED护眼灯推荐）</li>
            </ul>

            <h2>三、作息时间</h2>
            <p>一般宿舍会在晚上11:00断电（具体以学校规定为准），请合理安排时间。</p>
            
            <h2>四、室友相处建议</h2>
            <p>尊重彼此的生活习惯，有问题及时沟通，保持公共区域整洁。</p>
        `
    },
    'course-guide': {
        title: '📚 选课与学习攻略',
        category: '学习学术',
        date: '2024-08-17',
        content: `
            <h1>📚 选课与学习攻略</h1>
            <p>大学的学习模式与高中截然不同，了解这些能让你更好地规划学习。</p>
            
            <h2>一、选课系统</h2>
            <p>开学后会开放选课系统，建议提前了解课程安排，合理规划每学期课程。</p>
            
            <h2>二、学习建议</h2>
            <ul>
                <li>认真对待每一节课，尤其是专业基础课</li>
                <li>善用图书馆和自习室</li>
                <li>加入学习小组，互相帮助</li>
                <li>期末复习不要临时抱佛脚</li>
            </ul>

            <h2>三、学分制度</h2>
            <p>了解毕业所需学分要求，合理安排每学期选课数量。</p>
        `
    },
    'facility-guide': {
        title: '🏗️ 校园设施与服务',
        category: '设施服务',
        date: '2024-08-18',
        content: `
            <h1>🏗️ 校园设施与服务</h1>
            
            <h2>图书馆</h2>
            <p>开放时间：周一至周日 7:00-22:00，提供自习位、电子阅览室、研讨室等。</p>
            
            <h2>体育馆</h2>
            <p>包含篮球场、羽毛球场、游泳馆等设施，部分需要预约。</p>
            
            <h2>医务室</h2>
            <p>位于行政楼一楼，工作日8:00-17:00提供基本医疗服务。</p>
            
            <h2>快递收发</h2>
            <p>校内设有快递驿站，位于宿舍楼附近，取件时间8:00-20:00。</p>
        `
    },
    'club-guide': {
        title: '🎭 社团与课外活动',
        category: '社团活动',
        date: '2024-08-19',
        content: `
            <h1>🎭 社团与课外活动</h1>
            <p>丰富的课外活动是大学生活的重要组成部分。</p>
            
            <h2>社团招新</h2>
            <p>开学第2-3周为社团集中招新期，届时会有社团展示活动，可以现场了解和报名。</p>
            
            <h2>社团类型</h2>
            <ul>
                <li><strong>学术类</strong> - 辩论社、编程社、读书会等</li>
                <li><strong>文体类</strong> - 舞蹈社、音乐社、篮球社等</li>
                <li><strong>公益类</strong> - 志愿者协会、支教团等</li>
                <li><strong>创新创业类</strong> - 创业社、科技社等</li>
            </ul>

            <h2>建议</h2>
            <p>建议选择1-2个真正感兴趣的社团深度参与，不要贪多。</p>
        `
    },
    'food-guide': {
        title: '🍜 美食与餐饮指南',
        category: '校园生活',
        date: '2024-08-20',
        content: `
            <h1>🍜 美食与餐饮指南</h1>
            
            <h2>校内食堂</h2>
            <p>学校共有X个食堂，各有特色。</p>
            <ul>
                <li><strong>第一食堂</strong> - 综合菜品，性价比高</li>
                <li><strong>第二食堂</strong> - 特色小吃为主</li>
                <li><strong>教工食堂</strong> - 菜品精致，价格稍高</li>
            </ul>

            <h2>用餐时间</h2>
            <p>早餐 6:30-9:00 | 午餐 11:00-13:00 | 晚餐 17:00-19:30</p>
            
            <h2>周边美食</h2>
            <p>校门口有美食街，各种小吃、奶茶店一应俱全。</p>
        `
    }
};

function initGuide() {
    const guideList = $('#guide-list');
    const articleDetail = $('#article-detail');
    const articleContent = $('#article-content');

    // 分类筛选
    $$('.category-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            $$('.category-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const category = btn.dataset.category;
            $$('.guide-card').forEach(card => {
                if (category === 'all' || card.dataset.category === category) {
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });

    // 文章点击
    $$('.guide-card').forEach(card => {
        card.addEventListener('click', () => {
            const articleId = card.dataset.article;
            openArticle(articleId);
        });
    });

    // 返回按钮
    $('#back-to-guide').addEventListener('click', () => {
        articleDetail.style.display = 'none';
        guideList.style.display = 'grid';
        $('.guide-categories').style.display = 'flex';
    });
}

function openArticle(articleId) {
    const article = ARTICLES[articleId];
    if (!article) return;

    const guideList = $('#guide-list');
    const articleDetail = $('#article-detail');
    const articleContent = $('#article-content');

    guideList.style.display = 'none';
    $('.guide-categories').style.display = 'none';
    articleDetail.style.display = 'block';
    articleContent.innerHTML = article.content;

    // 存储当前文章ID供评论使用
    articleDetail.dataset.articleId = articleId;

    // 加载评论
    if (window.ForumModule) {
        window.ForumModule.loadComments(articleId);
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ===== 校园地图 =====
function initMap() {
    let scale = 1;
    const mapCanvas = $('#map-canvas');
    
    // 建筑信息
    const buildingInfo = {
        'teaching': {
            name: '📚 教学楼',
            desc: '主教学楼共6层，包含普通教室、多媒体教室和阶梯教室。1-3楼为公共教室，4-6楼为各学院专用教室。每层设有饮水机和休息区。'
        },
        'library': {
            name: '📖 图书馆',
            desc: '图书馆共5层，藏书超过XX万册。1楼为自习大厅，2-3楼为借阅区，4楼为电子阅览室和研讨室，5楼为期刊区。开放时间：7:00-22:00。'
        },
        'canteen': {
            name: '🍜 食堂',
            desc: '学生食堂共3层。1楼为大众餐厅，品种丰富价格实惠；2楼为特色小吃区；3楼为清真餐厅和教工餐厅。支持校园卡和手机支付。'
        },
        'gym': {
            name: '🏃 体育馆',
            desc: '体育馆包含室内篮球场、羽毛球场、乒乓球室、健身房和游泳馆。部分场地需要提前预约，可通过校园APP预约。'
        },
        'dormitory': {
            name: '🏠 宿舍楼',
            desc: '学生宿舍区共有X栋宿舍楼。配备空调、独立卫生间（部分）、公共洗衣房和自习室。门禁时间为23:00，请按时回宿舍。'
        },
        'admin-building': {
            name: '🏛️ 行政楼',
            desc: '行政楼是学校行政办公所在地，包括教务处、学生处、财务处等部门。1楼设有医务室和心理咨询中心。办公时间：周一至周五 8:00-17:00。'
        },
        'playground': {
            name: '⚽ 操场',
            desc: '标准400米跑道操场，包含足球场、篮球场和网球场。清晨和傍晚适合跑步锻炼，周末常有各类体育比赛。'
        },
        'gate': {
            name: '🚪 校门（正门）',
            desc: '学校正门，面朝XX路。门口有公交站（XX路、XX路），地铁X号线XX站步行约10分钟可达。出门右转即为商业街。'
        }
    };

    // 点击建筑
    $$('.map-building').forEach(building => {
        building.addEventListener('click', () => {
            const id = building.dataset.building;
            const info = buildingInfo[id];
            if (info) {
                $('#map-info-title').textContent = info.name;
                $('#map-info-body').innerHTML = `<p>${info.desc}</p>`;
                $('#map-info-panel').style.display = 'block';
                
                // 高亮当前建筑
                $$('.map-building').forEach(b => b.style.opacity = '0.5');
                building.style.opacity = '1';
            }
        });
    });

    // 关闭详情
    $('#map-info-close').addEventListener('click', () => {
        $('#map-info-panel').style.display = 'block';
        $('#map-info-title').textContent = '点击建筑查看详情';
        $('#map-info-body').innerHTML = '<p>请点击地图上的彩色建筑区域来查看对应的详细介绍。</p>';
        $$('.map-building').forEach(b => b.style.opacity = '1');
    });

    // 缩放控制
    $('#map-zoom-in').addEventListener('click', () => {
        scale = Math.min(scale + 0.2, 2.5);
        mapCanvas.style.transform = `scale(${scale})`;
    });

    $('#map-zoom-out').addEventListener('click', () => {
        scale = Math.max(scale - 0.2, 0.5);
        mapCanvas.style.transform = `scale(${scale})`;
    });

    $('#map-reset').addEventListener('click', () => {
        scale = 1;
        mapCanvas.style.transform = `scale(1)`;
        $$('.map-building').forEach(b => b.style.opacity = '1');
    });

    // 触摸缩放（手机端）
    let initialDistance = 0;
    const mapWrapper = $('#map-wrapper');
    
    mapWrapper.addEventListener('touchstart', (e) => {
        if (e.touches.length === 2) {
            initialDistance = Math.hypot(
                e.touches[0].pageX - e.touches[1].pageX,
                e.touches[0].pageY - e.touches[1].pageY
            );
        }
    });

    mapWrapper.addEventListener('touchmove', (e) => {
        if (e.touches.length === 2) {
            e.preventDefault();
            const currentDistance = Math.hypot(
                e.touches[0].pageX - e.touches[1].pageX,
                e.touches[0].pageY - e.touches[1].pageY
            );
            const ratio = currentDistance / initialDistance;
            scale = Math.min(Math.max(scale * ratio, 0.5), 2.5);
            mapCanvas.style.transform = `scale(${scale})`;
            initialDistance = currentDistance;
        }
    });
}

// ===== 表单年级班级初始化 =====
function initFormSelects() {
    const gradeSelects = ['#comment-grade', '#post-grade', '#reply-grade'];
    const classSelects = ['#comment-class', '#post-class', '#reply-class'];

    gradeSelects.forEach(selector => {
        const select = $(selector);
        if (!select) return;
        // 生成年级选项 2000-2099
        for (let year = 2020; year <= 2030; year++) {
            const option = document.createElement('option');
            option.value = year;
            option.textContent = `${year}级`;
            select.appendChild(option);
        }
    });

    classSelects.forEach(selector => {
        const select = $(selector);
        if (!select) return;
        // 生成班级选项 1-30
        for (let i = 1; i <= 30; i++) {
            const option = document.createElement('option');
            option.value = i;
            option.textContent = `${i}班`;
            select.appendChild(option);
        }
    });

    // 检查本地是否已存储用户信息
    const savedInfo = getStorage('user_info');
    if (savedInfo) {
        // 隐藏信息输入行
        ['#comment-info-row', '#post-info-row', '#reply-info-row'].forEach(selector => {
            const el = $(selector);
            if (el) {
                el.style.display = 'none';
                // 添加提示
                const hint = document.createElement('p');
                hint.className = 'form-hint';
                hint.textContent = `✓ 已记住身份信息（${savedInfo.grade}级${savedInfo.class_num}班）`;
                hint.style.color = '#10b981';
                el.parentNode.insertBefore(hint, el);
            }
        });

        // 填充昵称
        if (savedInfo.nickname) {
            ['#comment-nickname', '#post-nickname', '#reply-nickname'].forEach(selector => {
                const el = $(selector);
                if (el) el.value = savedInfo.nickname;
            });
        }
    }
}

// ===== 头像选择器 =====
function initAvatarPickers() {
    $$('.avatar-picker').forEach(picker => {
        picker.querySelectorAll('.avatar-option').forEach(option => {
            option.addEventListener('click', () => {
                picker.querySelectorAll('.avatar-option').forEach(o => o.classList.remove('selected'));
                option.classList.add('selected');
            });
        });
    });
}

// ===== 字数统计 =====
function initCharCounters() {
    const pairs = [
        { input: '#comment-content', counter: '#comment-char-count' },
        { input: '#post-content', counter: '#post-char-count' },
    ];

    pairs.forEach(({ input, counter }) => {
        const inputEl = $(input);
        const counterEl = $(counter);
        if (inputEl && counterEl) {
            inputEl.addEventListener('input', () => {
                counterEl.textContent = inputEl.value.length;
            });
        }
    });
}

// ===== 用户信息获取（通用） =====
function getUserInfo(prefix) {
    const savedInfo = getStorage('user_info');
    
    let nickname, avatar, grade, classNum;

    if (savedInfo) {
        nickname = $(`#${prefix}-nickname`).value.trim() || savedInfo.nickname;
        grade = savedInfo.grade;
        classNum = savedInfo.class_num;
    } else {
        nickname = $(`#${prefix}-nickname`).value.trim();
        grade = $(`#${prefix}-grade`).value;
        classNum = $(`#${prefix}-class`).value;
    }

    // 获取选中的头像
    const picker = $(`#${prefix}-avatar-picker`);
    const selectedAvatar = picker ? picker.querySelector('.avatar-option.selected') : null;
    avatar = selectedAvatar ? selectedAvatar.dataset.avatar : '😊';

    if (!nickname) {
        showToast('请输入昵称', 'warning');
        return null;
    }

    if (!savedInfo && (!grade || !classNum)) {
        showToast('请选择年级和班级', 'warning');
        return null;
    }

    // 保存用户信息
    if (!savedInfo) {
        storage('user_info', { nickname, avatar, grade, class_num: classNum });
        showToast('身份信息已记住，下次无需重复填写', 'success');
    }

    return { nickname, avatar, grade, class_num: classNum };
}

// ===== 应用初始化 =====
document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initWelcomeModal();
    initGuide();
    initMap();
    initFormSelects();
    initAvatarPickers();
    initCharCounters();
    
    console.log('🏫 校园指南已加载完成');
});