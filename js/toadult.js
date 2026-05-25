// Source ID to URL mapping for Porn sources
// Native JavaScript (No jQuery)

var pornSources = {
    'msnii': { url: 'https://www.msnii.com/api.php/provide/vod/at/json', name: '美少女资源站' },
    'xrbsp': { url: 'https://www.xrbsp.com/api.php/provide/vod/at/json', name: '淫水机资源站' },
    'slapibf': { url: 'https://slapibf.com/api.php/provide/vod/at/json', name: '森林资源站' },
    'lbapi9': { url: 'https://lbapi9.com/api.php/provide/vod/at/json', name: '乐播资源站' },
    'dadiapi': { url: 'https://dadiapi.net/api.php/provide/vod/at/json', name: '大地资源网' },
    '155api': { url: 'https://155api.com/api.php/provide/vod/at/json', name: '155资源站' },
    'apilsbzy2': { url: 'https://apilsbzy2.com/api.php/provide/vod/at/json', name: '老色逼' },
    'thzy1': { url: 'https://thzy1.com/api.php/provide/vod/at/json', name: '桃花资源' },
    'xiangjiaozyw': { url: 'https://xiangjiaozyw.com/api.php/provide/vod/at/json', name: '香蕉资源网' }
};

// Proxy for CORS
var proxy = {
    0: 'https://cors.luckydesigner.workers.dev/?',
    1: 'https://corsproxy.io/?',
    2: 'https://api.allorigins.win/raw?url=',
};
var rand = Math.floor(Math.random() * Object.keys(proxy).length);
var proxyRetryCount = 0;
var maxProxyRetries = 3;

// Get next proxy
function getNextProxy() {
    proxyRetryCount++;
    if (proxyRetryCount >= maxProxyRetries) {
        proxyRetryCount = 0;
        rand = (rand + 1) % Object.keys(proxy).length;
    }
    return proxy[rand];
}

var currentLink = '';
var currentCategory = '';
var pageNum = 1;
var isLoading = false;
var isSearchMode = false;

// Initialize source select from localStorage
function initSourceSelect() {
    var savedSources = localStorage.getItem('porn');
    var sourceSelect = document.getElementById('sourceSelect');
    
    // Clear existing options
    sourceSelect.innerHTML = '';
    
    if (savedSources) {
        // Parse saved sources
        var sourceIds = savedSources.split(',');
        var hasValidSource = false;
        
        // Add only saved sources
        sourceIds.forEach(function(id) {
            if (pornSources[id]) {
                var option = document.createElement('option');
                option.value = pornSources[id].url;
                option.textContent = pornSources[id].name;
                sourceSelect.appendChild(option);
                hasValidSource = true;
            }
        });
        
        // If no valid sources found, add all sources
        if (!hasValidSource) {
            Object.keys(pornSources).forEach(function(id) {
                var option = document.createElement('option');
                option.value = pornSources[id].url;
                option.textContent = pornSources[id].name;
                sourceSelect.appendChild(option);
            });
        }
    } else {
        // No saved settings, add all sources
        Object.keys(pornSources).forEach(function(id) {
            var option = document.createElement('option');
            option.value = pornSources[id].url;
            option.textContent = pornSources[id].name;
            sourceSelect.appendChild(option);
        });
    }
}

document.addEventListener('DOMContentLoaded', function() {
    // Initialize source select from localStorage
    initSourceSelect();
    
    // Initialize
    currentLink = document.getElementById('sourceSelect').value;
    loadCategories(currentLink);
    loadVideos(currentLink, '', 1);
    
    // Back button
    document.getElementById('backBtn').addEventListener('click', function() {
        window.history.back();
    });
    
    // Toggle sidebar
    function toggleSidebar() {
        var sidebar = document.getElementById('sidebar');
        var mainContent = document.getElementById('mainContent');
        
        if (window.innerWidth <= 768) {
            sidebar.classList.toggle('show-mobile');
        } else {
            sidebar.classList.toggle('collapsed');
            mainContent.classList.toggle('expanded');
        }
    }
    
    document.getElementById('toggleSidebar').addEventListener('click', toggleSidebar);
    document.getElementById('menuBtn').addEventListener('click', toggleSidebar);
    
    // Source select change
    document.getElementById('sourceSelect').addEventListener('change', function() {
        currentLink = this.value;
        currentCategory = '';
        pageNum = 1;
        isSearchMode = false;
        document.getElementById('searchInput').value = '';
        loadCategories(currentLink);
        loadVideos(currentLink, '', 1);
    });
    
    // Search
    document.getElementById('searchInput').addEventListener('keyup', function(e) {
        if (e.key === 'Enter') {
            var searchTerm = this.value.trim();
            
            if (searchTerm) {
                currentCategory = '';
                pageNum = 1;
                isSearchMode = true;
                // Clear category selection
                document.querySelectorAll('.category-item').forEach(function(el) {
                    el.classList.remove('active');
                });
                // Show loading state
                var mainContent = document.getElementById('mainContent');
                if (mainContent) {
                    var existingLoading = mainContent.querySelector('.loading-state');
                    if (existingLoading) existingLoading.remove();
                    document.getElementById('contentGrid').style.display = 'none';
                    var loadingDiv = document.createElement('div');
                    loadingDiv.className = 'loading-state search-loading';
                    loadingDiv.innerHTML = '<i class="fas fa-spinner"></i><span>Searching...</span>';
                    mainContent.insertBefore(loadingDiv, mainContent.firstChild);
                }
                searchVideos(currentLink, searchTerm, 1);
            } else {
                isSearchMode = false;
                loadVideos(currentLink, currentCategory, 1);
            }
        }
    });
    
    // Infinite scroll on content area
    document.getElementById('contentArea').addEventListener('scroll', function() {
        var scrollTop = this.scrollTop;
        var scrollHeight = this.scrollHeight;
        var clientHeight = this.clientHeight;
        
        if (scrollTop + clientHeight >= scrollHeight - 100 && !isLoading) {
            pageNum++;
            if (isSearchMode) {
                var searchTerm = document.getElementById('searchInput').value.trim();
                if (searchTerm) {
                    searchVideos(currentLink, searchTerm, pageNum);
                }
            } else {
                loadVideos(currentLink, currentCategory, pageNum);
            }
        }
    });
});

// Build API URL with proper format
function buildApiUrl(link, action, params) {
    // Handle URLs that already end with .php (no trailing slash needed)
    var baseUrl;
    if (link.endsWith('.php')) {
        baseUrl = link;
    } else {
        // Ensure URL ends with / before adding query params
        baseUrl = link.endsWith('/') ? link : link + '/';
    }
    var url = baseUrl + '?ac=' + action;
    
    if (params) {
        for (var key in params) {
            if (params[key]) {
                url += '&' + key + '=' + encodeURIComponent(params[key]);
            }
        }
    }
    
    // Use different proxy format for allorigins
    var selectedProxy = proxy[rand];
    if (selectedProxy.indexOf('allorigins') > -1) {
        // allorigins needs full URL encoding
        return selectedProxy + encodeURIComponent(url);
    } else {
        return selectedProxy + encodeURIComponent(url);
    }
}

// Parse API response (handles both JSON and XML)
function parseApiResponse(data) {
    // If it's already an object, return it
    if (typeof data === 'object') {
        return data;
    }
    
    // Try to parse as JSON first
    try {
        return JSON.parse(data);
    } catch (e) {
        // Not JSON, try XML
    }
    
    // Try to parse as XML
    try {
        var parser = new DOMParser();
        var xmlDoc = parser.parseFromString(data, 'text/xml');
        var result = {};
        
        // Parse list page
        var listEl = xmlDoc.querySelector('list');
        result.page = parseInt(listEl ? listEl.getAttribute('page') || '1' : '1');
        result.pagecount = parseInt(listEl ? listEl.getAttribute('pagecount') || '0' : '0');
        result.recordcount = parseInt(listEl ? listEl.getAttribute('recordcount') || '0' : '0');
        
        // Parse class categories
        result.class = [];
        var classItems = xmlDoc.querySelectorAll('class > ty');
        classItems.forEach(function(item) {
            result.class.push({
                type_id: item.getAttribute('id'),
                type_name: item.textContent
            });
        });
        
        // Parse video list
        result.list = [];
        var videos = xmlDoc.querySelectorAll('video');
        videos.forEach(function(video) {
            var idEl = video.querySelector('id');
            var nameEl = video.querySelector('name');
            var picEl = video.querySelector('pic');
            var tidEl = video.querySelector('tid');
            var typeEl = video.querySelector('type');
            var noteEl = video.querySelector('note');
            
            result.list.push({
                vod_id: idEl ? idEl.textContent : '',
                vod_name: nameEl ? nameEl.textContent : '',
                vod_pic: picEl ? picEl.textContent : '../images/noimage.jpeg',
                type_id: tidEl ? tidEl.textContent : '',
                type_name: typeEl ? typeEl.textContent : '',
                vod_remarks: noteEl ? noteEl.textContent : ''
            });
        });
        
        return result;
    } catch (e) {
        console.error('Failed to parse response:', e);
        return null;
    }
}

// Load categories (use API class data if available, otherwise extract from video list)
function loadCategories(link) {
    var apiUrl = buildApiUrl(link, 'list', { pg: 1 });
    
    fetch(apiUrl)
        .then(function(response) { return response.text(); })
        .then(function(data) {
            var parsedData = parseApiResponse(data);
            if (!parsedData) {
                document.getElementById('categoryList').innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-exclamation-triangle"></i>
                        <p>Failed to parse response</p>
                    </div>
                `;
                return;
            }
            
            var categoryList = document.getElementById('categoryList');
            categoryList.innerHTML = '';
            
            // Add "Latest Update" category
            var latestCat = document.createElement('div');
            latestCat.className = 'category-item active';
            latestCat.dataset.id = '';
            latestCat.innerHTML = '<i class="fas fa-clock"></i><span>最新更新</span>';
            categoryList.appendChild(latestCat);
            
            // Use class data from API if available
            var categories = parsedData.class || [];
            if (categories.length > 0) {
                // API returned class data
                for (var i = 0; i < categories.length; i++) {
                    var cat = categories[i];
                    var catId = cat.type_id;
                    var catName = cat.type_name;
                    if (catId && catName) {
                        var catItem = document.createElement('div');
                        catItem.className = 'category-item';
                        catItem.dataset.id = catId;
                        catItem.innerHTML = '<i class="fas fa-folder"></i><span>' + catName + '</span>';
                        categoryList.appendChild(catItem);
                    }
                }
            } else {
                // Fallback: extract unique categories from video list
                var categoryMap = {};
                var videos = parsedData.list || [];
                for (var i = 0; i < videos.length; i++) {
                    var video = videos[i];
                    var catId = video.type_id || video.tid;
                    var catName = video.type_name || video.type;
                    if (catId && catName && !categoryMap[catId]) {
                        categoryMap[catId] = catName;
                    }
                }
                
                // Add extracted categories
                for (var id in categoryMap) {
                    if (categoryMap.hasOwnProperty(id)) {
                        var catItem = document.createElement('div');
                        catItem.className = 'category-item';
                        catItem.dataset.id = id;
                        catItem.innerHTML = '<i class="fas fa-folder"></i><span>' + categoryMap[id] + '</span>';
                        categoryList.appendChild(catItem);
                    }
                }
            }
            
            // Click handler
            document.querySelectorAll('.category-item').forEach(function(item) {
                item.addEventListener('click', function() {
                    document.querySelectorAll('.category-item').forEach(function(el) {
                        el.classList.remove('active');
                    });
                    this.classList.add('active');
                    currentCategory = this.dataset.id;
                    pageNum = 1;
                    isSearchMode = false;
                    document.getElementById('searchInput').value = '';
                    loadVideos(currentLink, currentCategory, 1);
                });
            });
        })
        .catch(function() {
            document.getElementById('categoryList').innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>Failed to load categories</p>
                </div>
            `;
        });
}

// Load videos
function loadVideos(link, category, page) {
    if (isLoading) return;
    isLoading = true;
    
    // Show load more indicator for pagination
    if (page > 1) {
        document.getElementById('loadMoreIndicator').style.display = '';
    }
    
    if (page === 1) {
        document.getElementById('contentGrid').innerHTML = `
            <div class="loading-state">
                <i class="fas fa-spinner"></i>
                <span>Loading videos...</span>
            </div>
        `;
        document.getElementById('contentGrid').style.display = '';
    }
    
    var params = { pg: page };
    if (category) {
        params.t = category;
    }
    
    var apiUrl = buildApiUrl(link, 'videolist', params);
    
    fetch(apiUrl)
        .then(function(response) { return response.text(); })
        .then(function(data) {
            var parsedData = parseApiResponse(data);
            if (!parsedData) {
                if (page === 1) {
                    document.getElementById('contentGrid').innerHTML = `
                        <div class="empty-state">
                            <i class="fas fa-exclamation-triangle"></i>
                            <p>Failed to parse response</p>
                        </div>
                    `;
                }
                document.getElementById('loadMoreIndicator').style.display = 'none';
                isLoading = false;
                return;
            }
            
            if (page === 1) {
                document.getElementById('contentGrid').innerHTML = '';
            }
            
            var videos = parsedData.list || [];
            
            if (videos.length === 0 && page === 1) {
                document.getElementById('contentGrid').innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-video-slash"></i>
                        <p>No videos found</p>
                    </div>
                `;
            } else {
                renderVideos(videos, link, page === 1);
            }
            
            // Hide load more indicator
            document.getElementById('loadMoreIndicator').style.display = 'none';
            isLoading = false;
        })
        .catch(function() {
            if (page === 1) {
                document.getElementById('contentGrid').innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-exclamation-triangle"></i>
                        <p>Failed to load videos</p>
                    </div>
                `;
            }
            // Hide load more indicator
            document.getElementById('loadMoreIndicator').style.display = 'none';
            isLoading = false;
        });
}

// Search videos
function searchVideos(link, term, page) {
    if (isLoading && page === 1) return;
    if (page > 1 && isLoading) return;
    isLoading = true;
    
    // Show load more indicator for pagination
    if (page > 1) {
        document.getElementById('loadMoreIndicator').style.display = '';
    }
    
    var apiUrl = buildApiUrl(link, 'videolist', { wd: term, pg: page || 1 });
    
    fetch(apiUrl)
        .then(function(response) { return response.text(); })
        .then(function(data) {
            // Remove loading state first
            var searchLoading = document.querySelector('.search-loading');
            if (searchLoading) searchLoading.remove();
            document.getElementById('contentGrid').style.display = '';
            
            var parsedData = parseApiResponse(data);
            if (!parsedData) {
                document.getElementById('contentGrid').innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-exclamation-triangle"></i>
                        <p>Failed to parse response</p>
                    </div>
                `;
                document.getElementById('loadMoreIndicator').style.display = 'none';
                isLoading = false;
                return;
            }
            
            // Clear the grid for page 1
            if (page === 1) {
                var contentGrid = document.getElementById('contentGrid');
                contentGrid.classList.remove('has-results');
                contentGrid.innerHTML = '';
            }
            
            var videos = parsedData.list || [];
            
            if (videos.length === 0 && page === 1) {
                document.getElementById('contentGrid').innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-search"></i>
                        <p>No results found for "${term}"</p>
                    </div>
                `;
            } else if (videos.length > 0) {
                // Add has-results class to change positioning
                document.getElementById('contentGrid').classList.add('has-results');
                renderVideos(videos, link, page === 1);
            }
            
            // Hide load more indicator
            document.getElementById('loadMoreIndicator').style.display = 'none';
            isLoading = false;
        })
        .catch(function() {
            // Remove loading state on error too
            var searchLoading = document.querySelector('.search-loading');
            if (searchLoading) searchLoading.remove();
            document.getElementById('contentGrid').style.display = '';
            
            if (page === 1) {
                document.getElementById('contentGrid').innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-exclamation-triangle"></i>
                        <p>Search failed</p>
                    </div>
                `;
            }
            // Hide load more indicator
            document.getElementById('loadMoreIndicator').style.display = 'none';
            isLoading = false;
        });
}

// Filter ad text from category names
function filterTypeName(name) {
    if (!name) return name;
    return name.replace(/\\?">\* src=https?:\/\/[^\s<]+<\/script>/gi, '').trim();
}

// Render videos to grid
function renderVideos(videos, link, clear) {
    var contentGrid = document.getElementById('contentGrid');
    
    for (var i = 0; i < videos.length; i++) {
        var video = videos[i];
        var videoId = video.vod_id;
        var videoName = video.vod_name || '';
        var videoPic = video.vod_pic || '../images/noimage.jpeg';
        var videoType = filterTypeName(video.type_name) || '';
        
        var playUrl = '../catalogues/adultplay.html?web=' + encodeURIComponent(link) + '&tab=' + videoId;
        
        var cardHtml = `
            <a href="${playUrl}" class="card-item">
                <img class="card-image" src="${videoPic}" alt="${videoName}" onerror="this.src='../images/noimage.jpeg'">
                <div class="card-overlay"></div>
                <div class="card-play-icon">
                    <i class="fas fa-play"></i>
                </div>
                <div class="card-info">
                    ${videoType ? `<span class="card-type">${videoType}</span>` : ''}
                    <h4 class="card-title">${videoName}</h4>
                </div>
            </a>
        `;
        contentGrid.insertAdjacentHTML('beforeend', cardHtml);
    }
}
