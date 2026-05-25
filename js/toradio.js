// Radio Page JS - Modern UI Version
// Native JavaScript (No jQuery)

// Set a array to store source links
var radiosource = ['https://de1.api.radio-browser.info/'];
// Set a random integer
var rand = Math.floor(Math.random() * radiosource.length);

document.addEventListener('DOMContentLoaded', function() {
    // Tab 切换功能
    document.querySelectorAll('.tab-btn').forEach(function(btn) {
        btn.addEventListener('click', function() {
            var targetTab = this.dataset.tab;
            
            // 切换 tab 按钮状态
            document.querySelectorAll('.tab-btn').forEach(function(el) {
                el.classList.remove('active');
            });
            this.classList.add('active');
            
            // 切换内容区域
            document.querySelectorAll('.tab-content').forEach(function(el) {
                el.classList.remove('active');
            });
            document.getElementById(targetTab).classList.add('active');
            
            // 清空搜索框
            document.getElementById('searchInput').value = '';
            // 显示所有卡片
            document.querySelectorAll('.item-card').forEach(function(el) {
                el.style.display = '';
            });
        });
    });
    
    // 搜索功能
    document.getElementById('searchInput').addEventListener('input', function() {
        var searchTerm = this.value.toLowerCase();
        var activeTab = document.querySelector('.tab-content.active').id;
        
        document.querySelectorAll('#' + activeTab + ' .item-card').forEach(function(card) {
            var text = card.querySelector('a').textContent.toLowerCase();
            if (text.indexOf(searchTerm) > -1) {
                card.style.display = '';
            } else {
                card.style.display = 'none';
            }
        });
    });
    
    // 返回按钮
    document.getElementById('backBtn').addEventListener('click', function() {
        window.history.back();
    });
    
    // 卡片点击跳转 - 使用事件委托
    document.addEventListener('click', function(e) {
        var card = e.target.closest('.item-card');
        if (card) {
            // 如果点击的是a标签本身，让它自然跳转
            if (e.target.tagName === 'A') {
                return;
            }
            var link = card.querySelector('a');
            if (link) {
                window.location.href = link.getAttribute('href');
            }
        }
    });
    
    // 动态加载 Countries 列表
    function loadCountries() {
        fetch(radiosource[rand] + 'json/countries')
            .then(function(response) { return response.json(); })
            .then(function(data) {
                var grid = document.getElementById('countries-grid');
                grid.innerHTML = '';
                // 按名称排序
                data.sort(function(a, b) {
                    return a.name.localeCompare(b.name);
                });
                for (var i = 0; i < data.length; i++) {
                    var country = data[i];
                    var name = country.name;
                    // 处理台湾名称
                    var displayName = name === 'Taiwan Province Of China' ? 'Taiwan' : name;
                    var stationcount = country.stationcount;
                    var link = '../catalogues/radioplay.html?tab=' + encodeURIComponent(name) + '&t=1';
                    var cardHtml = '<div class="item-card">' +
                        '<a href="' + link + '">' + displayName + '</a>' +
                        '<span class="station-count">' + stationcount + ' stations</span>' +
                        '</div>';
                    grid.insertAdjacentHTML('beforeend', cardHtml);
                }
            })
            .catch(function() {
                document.getElementById('countries-grid').innerHTML = '<div class="no-results"><i class="fas fa-exclamation-triangle"></i><p>Failed to load countries list</p></div>';
            });
    }
    
    // 动态加载 Languages 列表
    function loadLanguages() {
        fetch(radiosource[rand] + 'json/languages')
            .then(function(response) { return response.json(); })
            .then(function(data) {
                var grid = document.getElementById('languages-grid');
                grid.innerHTML = '';
                // 按名称排序
                data.sort(function(a, b) {
                    return a.name.localeCompare(b.name);
                });
                for (var i = 0; i < data.length; i++) {
                    var lang = data[i];
                    var name = lang.name;
                    var stationcount = lang.stationcount;
                    var link = '../catalogues/radioplay.html?tab=' + encodeURIComponent(name) + '&t=2';
                    var cardHtml = '<div class="item-card">' +
                        '<a href="' + link + '">' + name + '</a>' +
                        '<span class="station-count">' + stationcount + ' stations</span>' +
                        '</div>';
                    grid.insertAdjacentHTML('beforeend', cardHtml);
                }
            })
            .catch(function() {
                document.getElementById('languages-grid').innerHTML = '<div class="no-results"><i class="fas fa-exclamation-triangle"></i><p>Failed to load languages list</p></div>';
            });
    }
    
    // 动态加载 Tags (Category) 列表
    function loadTags() {
        fetch(radiosource[rand] + 'json/tags')
            .then(function(response) { return response.json(); })
            .then(function(data) {
                var grid = document.getElementById('category-grid');
                grid.innerHTML = '';
                // 按名称排序
                data.sort(function(a, b) {
                    return a.name.localeCompare(b.name);
                });
                for (var i = 0; i < data.length; i++) {
                    var tag = data[i];
                    var name = tag.name;
                    var stationcount = tag.stationcount;
                    var link = '../catalogues/radioplay.html?tab=' + encodeURIComponent(name) + '&t=3';
                    var cardHtml = '<div class="item-card">' +
                        '<a href="' + link + '">' + name + '</a>' +
                        '<span class="station-count">' + stationcount + ' stations</span>' +
                        '</div>';
                    grid.insertAdjacentHTML('beforeend', cardHtml);
                }
            })
            .catch(function() {
                document.getElementById('category-grid').innerHTML = '<div class="no-results"><i class="fas fa-exclamation-triangle"></i><p>Failed to load tags list</p></div>';
            });
    }
    
    // 页面加载时获取数据
    loadCountries();
    loadLanguages();
    loadTags();
    
    // 错误检测
    setInterval(function() {
        var countriesGrid = document.getElementById('countries-grid');
        var languagesGrid = document.getElementById('languages-grid');
        var categoryGrid = document.getElementById('category-grid');
        
        if (countriesGrid.querySelectorAll('.item-card').length === 0 && countriesGrid.querySelectorAll('.loading-spinner').length === 0) {
            if (countriesGrid.querySelectorAll('.no-results').length === 0) {
                loadCountries();
            }
        }
        if (languagesGrid.querySelectorAll('.item-card').length === 0 && languagesGrid.querySelectorAll('.loading-spinner').length === 0) {
            if (languagesGrid.querySelectorAll('.no-results').length === 0) {
                loadLanguages();
            }
        }
        if (categoryGrid.querySelectorAll('.item-card').length === 0 && categoryGrid.querySelectorAll('.loading-spinner').length === 0) {
            if (categoryGrid.querySelectorAll('.no-results').length === 0) {
                loadTags();
            }
        }
    }, 10000);
});
