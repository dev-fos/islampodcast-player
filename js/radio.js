// Radio Player JS - Extracted from radioplay.html
// Radio Browser API source
var radiosource = ['https://de1.api.radio-browser.info/'];
var rand = Math.floor(Math.random() * radiosource.length);
var stations = [];
var player;

// Favorite prefix for localStorage - ensures only this app's favorites are shown
const FAV_PREFIX = 'radio_fav_';

$(document).ready(function() {
    // Initialize video.js player
    player = videojs('video1');
    
    // Error handling - prevent loading spinner and error icon showing simultaneously
    player.on('error', function() {
        player.removeClass('vjs-waiting');
        player.removeClass('vjs-loading');
    });
    
    // Parse URL parameters
    var urlParams = new URLSearchParams(window.location.search);
    var tab = urlParams.get('tab');
    var type = urlParams.get('t');
    
    // Set page title
    var displayName = tab === 'Taiwan Province Of China' ? 'Taiwan' : tab;
    document.title = displayName + ' - Radio Player';
    $('#categoryTitle').text(displayName);
    
    // API endpoints by type
    // t=1: by country, t=2: by language, t=3: by tag
    var apiEndpoints = ['', 'json/stations/bycountry/', 'json/stations/bylanguage/', 'json/stations/bytag/'];
    
    // Load stations
    if (tab && type) {
        loadStations(tab, apiEndpoints[parseInt(type)]);
    }
    
    // Load favorites
    loadFavorites();
    
    // ========== UI Event Handlers ==========
    
    // Toggle sidebar - toggle station list and toolbar visibility
    function toggleSidebar() {
        var sidebar = $('#sidebar');
        var toolbar = $('#top-toolbar');
        
        // Toggle sidebar
        if (window.innerWidth <= 768) {
            sidebar.toggleClass('show-mobile');
        } else {
            sidebar.toggleClass('collapsed');
        }
        
        // Show toolbar when sidebar is expanded, hide when collapsed
        var isExpanded = (window.innerWidth <= 768) ? sidebar.hasClass('show-mobile') : !sidebar.hasClass('collapsed');
        
        if (isExpanded) {
            toolbar.removeClass('hidden');
        } else {
            toolbar.addClass('hidden');
        }
    }
    
    // Toggle Sidebar button
    $('#toggleSidebar').on('click', function() {
        toggleSidebar();
    });
    
    // Menu Button - hides toolbar for immersive mode
    $('#menuBtn').on('click', function() {
        var sidebar = $('#sidebar');
        var toolbar = $('#top-toolbar');
        
        // Hide toolbar for immersive mode
        toolbar.addClass('hidden');
        
        // Collapse sidebar
        if (window.innerWidth <= 768) {
            sidebar.removeClass('show-mobile');
        } else {
            sidebar.addClass('collapsed');
        }
    });
    
    // Back Button
    $('#backBtn').on('click', function() {
        window.history.back();
    });
    
    // Link Input Toggle
    $('#linkBtn').on('click', function() {
        $('#linkInputWrapper').toggleClass('show');
    });
    
    // Play Custom Link
    $('#playLinkBtn').on('click', function() {
        var link = $('#linkInput').val();
        if (link) {
            playStation(link, 'Custom URL', '');
        }
    });
    
    // Favorite Panel Toggle
    $('#favoriteBtn').on('click', function() {
        $('#favoritePanel').toggleClass('show');
    });
    
    // GitHub Button
    $('#githubBtn').on('click', function() {
        window.open('https://github.com/zhangboheng/Easy-Web-TV-M3u8', '_blank');
    });
    
    // Shuffle Play
    $('#shuffleBtn').on('click', function() {
        if (stations.length > 0) {
            var randomIndex = Math.floor(Math.random() * stations.length);
            var station = stations[randomIndex];
            playStation(station.url, station.name, station.country);
        }
    });
    
    // Station Search
    $('#stationSearch').on('input', function() {
        var searchTerm = $(this).val().toLowerCase();
        $('#stationList .station-item').each(function() {
            var name = $(this).find('.station-name').text().toLowerCase();
            if (name.indexOf(searchTerm) > -1) {
                $(this).show();
            } else {
                $(this).hide();
            }
        });
    });
    
    // Close panels when clicking outside
    $(document).on('click', function(e) {
        if (!$(e.target).closest('#favoritePanel, #favoriteBtn').length) {
            $('#favoritePanel').removeClass('show');
        }
        if (!$(e.target).closest('#linkInputWrapper, #linkBtn').length) {
            $('#linkInputWrapper').removeClass('show');
        }
    });
    
    // Player events
    player.on('pause', function() {
        $('#radioVisualizer').addClass('paused');
    });
    
    player.on('play', function() {
        $('#radioVisualizer').removeClass('paused');
    });
});

// Load stations from API
function loadStations(tab, endpoint) {
    $.ajax({
        type: "GET",
        url: radiosource[rand] + endpoint + encodeURIComponent(tab),
        success: function(data) {
            $('#stationList').empty();
            stations = [];
            
            if (data && data.length > 0) {
                $('#stationCount').text(data.length);
                
                for (var i = 0; i < data.length; i++) {
                    var station = data[i];
                    stations.push({
                        url: station.url,
                        name: station.name,
                        country: station.country,
                        favicon: station.favicon
                    });
                    
                    var isFavorite = localStorage.getItem(FAV_PREFIX + station.url) === station.name;
                    var favoriteClass = isFavorite ? 'active' : '';
                    
                    var itemHtml = `
                        <div class="station-item" data-url="${station.url}" data-name="${escapeHtml(station.name)}" data-country="${escapeHtml(station.country)}">
                            <div class="station-icon">
                                <i class="fas fa-radio"></i>
                            </div>
                            <span class="station-name" title="${escapeHtml(station.name)}">${escapeHtml(station.name)}</span>
                            <i class="fas fa-heart favorite-btn ${favoriteClass}" title="Add to favorites"></i>
                        </div>
                    `;
                    $('#stationList').append(itemHtml);
                }
                
                // Auto-play first station
                playStation(data[0].url, data[0].name, data[0].country);
                
                // Click handler for station items
                $('.station-item').on('click', function(e) {
                    if ($(e.target).hasClass('favorite-btn')) {
                        // Handle favorite
                        toggleFavorite($(this).data('url'), $(this).data('name'), $(e.target));
                    } else {
                        // Play station
                        playStation($(this).data('url'), $(this).data('name'), $(this).data('country'));
                    }
                });
            } else {
                $('#stationList').html(`
                    <div class="no-stations">
                        <i class="fas fa-broadcast-tower"></i>
                        <p>No stations found</p>
                    </div>
                `);
            }
        },
        error: function() {
            $('#stationList').html(`
                <div class="no-stations">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>Failed to load stations. Please check your internet connection.</p>
                </div>
            `);
        }
    });
}

// Play station
function playStation(url, name, country) {
    var type = url.indexOf('m3u8') > -1 ? 'application/x-mpegURL' : 'audio/mp3';
    
    player.src({
        src: url,
        type: type
    });
    player.play();
    
    // Update UI
    $('#currentStation').text(name);
    $('#stationTitle').text(name);
    if (country) {
        $('#stationCountry').html('<i class="fas fa-globe"></i><span>' + country + '</span>');
    }
    
    // Start visualizer animation
    $('#radioVisualizer').removeClass('paused');
    
    // Update active state
    $('.station-item').removeClass('active');
    $('.station-item[data-url="' + url + '"]').addClass('active');
}

// Toggle favorite
function toggleFavorite(url, name, btn) {
    var favKey = FAV_PREFIX + url;
    var existingName = localStorage.getItem(favKey);
    
    if (existingName) {
        localStorage.removeItem(favKey);
        btn.removeClass('active');
    } else {
        localStorage.setItem(favKey, name);
        btn.addClass('active');
    }
    
    loadFavorites();
}

// Load favorites
function loadFavorites() {
    var favorites = [];
    
    for (var i = 0; i < localStorage.length; i++) {
        var key = localStorage.key(i);
        if (key.startsWith(FAV_PREFIX)) {
            favorites.push({
                url: key.substring(FAV_PREFIX.length),
                name: localStorage.getItem(key)
            });
        }
    }
    
    $('#favCount').text(favorites.length);
    
    if (favorites.length > 0) {
        $('#favoriteContent').empty();
        
        for (var j = 0; j < favorites.length; j++) {
            var fav = favorites[j];
            var itemHtml = `
                <div class="favorite-item" data-url="${fav.url}">
                    <i class="fas fa-heart"></i>
                    <span>${escapeHtml(fav.name)}</span>
                    <i class="fas fa-times delete-btn" title="Remove from favorites"></i>
                </div>
            `;
            $('#favoriteContent').append(itemHtml);
        }
        
        // Click handler for favorite items (play)
        $('.favorite-item').on('click', function(e) {
            if ($(e.target).hasClass('delete-btn')) {
                // Delete favorite
                var url = $(this).data('url');
                localStorage.removeItem(FAV_PREFIX + url);
                $(this).remove();
                
                // Update station list favorite icons
                $('.station-item[data-url="' + url + '"]').find('.favorite-btn').removeClass('active');
                
                // Update count and check if empty
                var remaining = $('.favorite-item').length;
                $('#favCount').text(remaining);
                if (remaining === 0) {
                    $('#favoriteContent').html(`
                        <div class="no-stations" style="padding: 20px;">
                            <i class="fas fa-heart-broken" style="font-size: 24px;"></i>
                            <span style="font-size: 12px;">No favorites yet</span>
                        </div>
                    `);
                }
            } else {
                // Play station
                playStation($(this).data('url'), $(this).find('span').text(), '');
                $('#favoritePanel').removeClass('show');
            }
        });
    } else {
        $('#favoriteContent').html(`
            <div class="no-stations" style="padding: 20px;">
                <i class="fas fa-heart-broken" style="font-size: 24px;"></i>
                <span style="font-size: 12px;">No favorites yet</span>
            </div>
        `);
    }
}

// Escape HTML special characters
function escapeHtml(text) {
    if (!text) return '';
    var div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
