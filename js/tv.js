// TV Channels Page JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Tab 切换功能
    document.querySelectorAll('.tab-btn').forEach(function(btn) {
        btn.addEventListener('click', function() {
            var targetTab = this.getAttribute('data-tab');
            
            // 切换 tab 按钮状态
            document.querySelectorAll('.tab-btn').forEach(function(b) {
                b.classList.remove('active');
            });
            this.classList.add('active');
            
            // 切换内容区域
            document.querySelectorAll('.tab-content').forEach(function(content) {
                content.classList.remove('active');
            });
            document.getElementById(targetTab).classList.add('active');
        });
    });
    
    // 搜索功能
    var searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            var searchTerm = this.value.toLowerCase();
            var activeTab = document.querySelector('.tab-content.active');
            
            if (activeTab) {
                activeTab.querySelectorAll('.item-card').forEach(function(card) {
                    var text = card.querySelector('a').textContent.toLowerCase();
                    if (text.indexOf(searchTerm) > -1) {
                        card.style.display = '';
                    } else {
                        card.style.display = 'none';
                    }
                });
            }
        });
    }
    
    // 返回按钮
    var backBtn = document.getElementById('backBtn');
    if (backBtn) {
        backBtn.addEventListener('click', function() {
            window.history.back();
        });
    }
    
    // 卡片点击跳转 - 使用事件委托
    document.addEventListener('click', function(e) {
        var card = e.target.closest('.item-card');
        if (card) {
            // 如果点击的是a标签本身，让它自然跳转
            if (e.target.tagName === 'A') {
                return;
            }
            var link = card.querySelector('a');
            if (link && link.getAttribute('href')) {
                window.location.href = link.getAttribute('href');
            }
        }
    });
    
    // 动态加载 Countries 列表
    function loadCountries() {
        fetch('https://iptv-org.github.io/api/countries.json')
            .then(function(response) {
                return response.json();
            })
            .then(function(data) {
                var grid = document.getElementById('countries-grid');
                grid.innerHTML = '';
                // 按名称排序
                data.sort(function(a, b) {
                    return a.name.localeCompare(b.name);
                });
                data.forEach(function(country) {
                    var code = country.code.toLowerCase();
                    var name = country.name;
                    var flag = country.flag;
                    var link = '../catalogues/tvplay.html?type=countries&key=' + code + '&title=' + encodeURIComponent(name);
                    var card = document.createElement('div');
                    card.className = 'item-card';
                    card.innerHTML = '<span class="flag-icon">' + flag + '</span><a href="' + link + '">' + name + '</a>';
                    grid.appendChild(card);
                });
            })
            .catch(function() {
                document.getElementById('countries-grid').innerHTML = '<div class="no-results"><i class="fas fa-exclamation-triangle"></i><p>Failed to load countries list</p></div>';
            });
    }
    
    // 动态加载 Languages 列表
    function loadLanguages() {
        fetch('https://iptv-org.github.io/api/languages.json')
            .then(function(response) {
                return response.json();
            })
            .then(function(data) {
                var grid = document.getElementById('languages-grid');
                grid.innerHTML = '';
                // 按名称排序
                data.sort(function(a, b) {
                    return a.name.localeCompare(b.name);
                });
                data.forEach(function(lang) {
                    var code = lang.code;
                    var name = lang.name;
                    var link = '../catalogues/tvplay.html?type=languages&key=' + code + '&title=' + encodeURIComponent(name);
                    var card = document.createElement('div');
                    card.className = 'item-card';
                    card.innerHTML = '<i class="fas fa-comments card-icon"></i><a href="' + link + '">' + name + '</a>';
                    grid.appendChild(card);
                });
            })
            .catch(function() {
                document.getElementById('languages-grid').innerHTML = '<div class="no-results"><i class="fas fa-exclamation-triangle"></i><p>Failed to load languages list</p></div>';
            });
    }
    
    // 动态加载 Categories 列表
    function loadCategories() {
        fetch('https://iptv-org.github.io/api/categories.json')
            .then(function(response) {
                return response.json();
            })
            .then(function(data) {
                var grid = document.getElementById('category-grid');
                grid.innerHTML = '';
                // 按名称排序
                data.sort(function(a, b) {
                    return a.name.localeCompare(b.name);
                });
                // 分类图标映射
                var iconMap = {
                    'animation': 'fa-film',
                    'auto': 'fa-car',
                    'business': 'fa-briefcase',
                    'classic': 'fa-clock',
                    'comedy': 'fa-laugh',
                    'cooking': 'fa-utensils',
                    'culture': 'fa-palette',
                    'documentary': 'fa-book',
                    'education': 'fa-graduation-cap',
                    'entertainment': 'fa-theater-masks',
                    'family': 'fa-users',
                    'general': 'fa-tv',
                    'interactive': 'fa-gamepad',
                    'kids': 'fa-child',
                    'legislative': 'fa-landmark',
                    'lifestyle': 'fa-heart',
                    'movies': 'fa-film',
                    'music': 'fa-music',
                    'news': 'fa-newspaper',
                    'outdoor': 'fa-tree',
                    'relax': 'fa-spa',
                    'religious': 'fa-church',
                    'science': 'fa-flask',
                    'series': 'fa-play-circle',
                    'shopping': 'fa-shopping-cart',
                    'sports': 'fa-futbol',
                    'tech': 'fa-microchip',
                    'travel': 'fa-plane',
                    'weather': 'fa-cloud-sun',
                    'undefined': 'fa-ellipsis-h'
                };
                data.forEach(function(cat) {
                    var id = cat.id;
                    var name = cat.name;
                    var icon = iconMap[id] || 'fa-folder';
                    var link = '../catalogues/tvplay.html?type=categories&key=' + id + '&title=' + encodeURIComponent(name);
                    var card = document.createElement('div');
                    card.className = 'item-card';
                    card.setAttribute('data-category', id);
                    card.innerHTML = '<i class="fas ' + icon + ' card-icon"></i><a href="' + link + '">' + name + '</a>';
                    grid.appendChild(card);
                });
            })
            .catch(function() {
                document.getElementById('category-grid').innerHTML = '<div class="no-results"><i class="fas fa-exclamation-triangle"></i><p>Failed to load categories list</p></div>';
            });
    }
    
    // 页面加载时获取数据
    loadCountries();
    loadLanguages();
    loadCategories();
});
