// TV/Radio Channels Play Page JS
// Native JavaScript (No jQuery)

var channels = [];
//Get default localstorage key
var localkey = ['manga', 'bannedcountries', 'novel', 'movie', 'music', 'languages', 'porn', 'adult'];
var player = null;

document.addEventListener('DOMContentLoaded', function() {
    var video1 = document.getElementById('video1');
    var div1 = document.getElementById('div1');
    
    video1.style.width = div1.offsetWidth + 'px';
    video1.style.height = div1.offsetHeight + 'px';
    
    var toggle = document.querySelector('.toggle');
    var left = document.getElementById('left');
    if (toggle && left) {
        toggle.style.left = (left.offsetWidth - 50) + 'px';
    }
    
    player = videojs(document.querySelector('#video1'));

    //Get Current href
    var key = decodeURIComponent(window.location.href).split('=')[1].split('&')[0];

    //Set Page Title
    var titleText = key.toUpperCase().charAt(0) + key.slice(1) + ' Channels';
    document.title = titleText;
    
    var leftH3 = document.querySelector('#left h3');
    if (leftH3) {
        leftH3.innerHTML = '';
        leftH3.innerHTML = titleText;
    }
    
    //Get iptv-org m3u list and show contents lists
    fetch('https://iptv-org.github.io/iptv/categories/' + key + '.m3u')
        .then(function(response) { return response.text(); })
        .then(function(message) {
            var menu = document.getElementById('menu');
            menu.innerHTML = '';
            
            var searchLi = document.createElement('li');
            searchLi.style.backgroundColor = '#fff';
            searchLi.innerHTML = '<input id="search" type="text" placeholder="Search..." />';
            menu.appendChild(searchLi);
            
            var channelcontent = document.getElementById('channelcontent');
            channelcontent.innerHTML = '';
            
            var str = message;
            var lst = str.split(",").slice(1).filter(function(x) { return /[^h]+.m3u8/.test(x); }).map(function(x) { return x.split("\n"); });
            var array = str.split(" ");
            var links = array.filter(function(x) { return /[^h]+.m3u8/.test(x); }).map(function(x) { return x.split("\n"); }).flat().filter(function(x) { return /[^h]+.m3u8/.test(x); });
            
            for (var i = 0; i < links.length; i++) {
                channels.push(links[i]);
                if (i === 0) {
                    player.src({
                        src: links[0],
                        type: 'application/x-mpegURL'
                    });
                    player.play();
                }
                
                var li = document.createElement('li');
                var isFavorited = window.localStorage.getItem(links[i]) === lst[i][0];
                var favImg = window.innerWidth > 640 ? 
                    (isFavorited ? '../images/favorite.png' : '../images/unfavorite.png') :
                    (isFavorited ? '../images/favorite20.png' : '../images/unfavorite20.png');
                
                li.innerHTML = '<p><input type="button" style="background-image: url(\'' + favImg + '\');" /><span title="' + links[i] + '">' + lst[i][0] + '</span></p>';
                menu.appendChild(li);
            }
            
            //Append favorite list
            Object.keys(localStorage).forEach(function(i) {
                if (!localkey.includes(i)) {
                    var li = document.createElement('li');
                    var favImg = window.innerWidth > 640 ? '../images/favorite.png' : '../images/favorite20.png';
                    li.innerHTML = '<p><input type="button" style="background-image: url(\'' + favImg + '\');" /><span title="' + i + '">' + localStorage[i] + '</span></p>';
                    channelcontent.appendChild(li);
                }
            });
            
            //Click channels to play
            var spans = document.querySelectorAll('li p span');
            spans.forEach(function(span) {
                span.addEventListener('click', function() {
                    player.src({
                        src: this.getAttribute('title'),
                        type: 'application/x-mpegURL'
                    });
                    player.play();
                });
            });
            
            //Click play random channels
            var shuffleplay = document.getElementById('shuffleplay');
            if (shuffleplay) {
                shuffleplay.addEventListener('click', function() {
                    var detail = channels[Math.floor(Math.random() * channels.length)];
                    player.src({
                        src: detail,
                        type: 'application/x-mpegURL'
                    });
                    player.play();
                });
            }
            
            //Change icon size (favorite button)
            var menuInputs = document.querySelectorAll('#menu li p input');
            menuInputs.forEach(function(input) {
                input.addEventListener('click', function() {
                    var span = this.nextElementSibling;
                    //Get browser support localstorage if or not
                    if (!window.localStorage) {
                        console.log("Browser not support localstorage");
                        return false;
                    } else {
                        window.localStorage.setItem(span.getAttribute('title'), span.textContent);
                    }
                    if (window.innerWidth > 640) {
                        this.style.backgroundImage = 'url(../images/favorite.png)';
                    } else {
                        this.style.backgroundImage = 'url(../images/favorite20.png)';
                    }
                    if (span.getAttribute('title').length > 0) {
                        window.location.reload();
                    }
                });
            });
            
            //Collect favorite channles
            var channelInputs = document.querySelectorAll('#channelcontent li p input');
            channelInputs.forEach(function(input) {
                input.addEventListener('click', function() {
                    var span = this.nextElementSibling;
                    //Get browser support localstorage if or not
                    if (!window.localStorage) {
                        console.log("Browser not support localstorage");
                        return false;
                    } else {
                        localStorage.removeItem(span.getAttribute('title'));
                    }
                    if (window.innerWidth > 640) {
                        this.style.backgroundImage = 'url(../images/unfavorite.png)';
                    } else {
                        this.style.backgroundImage = 'url(../images/unfavorite20.png)';
                    }
                    window.location.reload();
                });
            });
            
            //Search Channels
            var searchInput = document.getElementById('search');
            if (searchInput) {
                searchInput.addEventListener('keyup', function(e) {
                    var valThis = this.value.toLowerCase();
                    var lis = document.querySelectorAll('#menu li');
                    if (valThis === "") {
                        lis.forEach(function(li, index) {
                            if (index > 0) li.style.display = '';
                        });
                    } else {
                        lis.forEach(function(li, index) {
                            if (index > 0) {
                                var text = li.textContent.toLowerCase();
                                if (text.indexOf(valThis) > -1) {
                                    li.style.display = '';
                                } else {
                                    li.style.display = 'none';
                                }
                            }
                        });
                    }
                });
            }
            
            //Complete - set first item as selected and add click handlers
            var menuLis = document.querySelectorAll('#menu li');
            if (menuLis.length > 0) {
                menuLis[0].classList.add('bd');
            }
            menuLis.forEach(function(li) {
                li.addEventListener('click', function() {
                    menuLis.forEach(function(item) {
                        item.classList.remove('bd');
                    });
                    this.classList.add('bd');
                });
            });
        })
        .catch(function(xhr, textStatus, errorThrown) {
            alert("Please check your Internet or the iptv source has gone out!");
        });
    
    //Set Toggle Menu
    if (toggle) {
        toggle.addEventListener('click', function() {
            if (left.style.display !== 'none') {
                left.style.display = 'none';
                toggle.style.left = '5px';
            } else {
                left.style.display = '';
                toggle.style.left = (left.offsetWidth - 50) + 'px';
            }
        });
    }
    
    //Set M3U8 links to play
    var playerBtn = document.getElementById('player');
    if (playerBtn) {
        playerBtn.addEventListener('mouseenter', function() {
            this.style.opacity = '1';
        });
        playerBtn.addEventListener('click', function() {
            this.style.backgroundImage = 'url(../images/player.jpg)';
            this.style.border = '1px solid #fff';
            
            var inputlink = document.getElementById('inputlink');
            if (window.innerWidth > 640) {
                inputlink.style.display = 'block';
            } else {
                inputlink.style.display = inputlink.style.display === 'block' ? 'none' : 'block';
            }
            
            var link = inputlink.value;
            if (link.length > 0) {
                player.src({
                    src: link,
                    type: 'application/x-mpegURL'
                });
                player.play();
            }
            inputlink.value = '';
        });
        playerBtn.addEventListener('mouseleave', function() {
            this.style.opacity = '0.5';
        });
    }
    
    //Set Tools Menu
    var menuicon = document.getElementById('menuicon');
    if (menuicon) {
        menuicon.addEventListener('mouseenter', function() {
            this.style.opacity = '1';
        });
        menuicon.addEventListener('click', function() {
            var controlDivs = document.querySelectorAll('#control > div');
            controlDivs.forEach(function(div, index) {
                if (index > 0) {
                    if (div.style.display === 'none') {
                        div.style.display = 'block';
                    } else {
                        div.style.display = 'none';
                    }
                }
            });
            var channelist = document.getElementById('channelist');
            var inputlink = document.getElementById('inputlink');
            if (channelist) channelist.style.display = 'none';
            if (inputlink) inputlink.style.display = 'none';
        });
        menuicon.addEventListener('mouseleave', function() {
            this.style.opacity = '0.5';
        });
    }
    
    //Set return home page
    var prev = document.getElementById('prev');
    if (prev) {
        prev.addEventListener('mouseenter', function() {
            this.style.opacity = '1';
        });
        prev.addEventListener('click', function() {
            window.history.back();
        });
        prev.addEventListener('mouseleave', function() {
            this.style.opacity = '0.5';
        });
    }
    
    //Set Github link
    var github = document.getElementById('github');
    if (github) {
        github.addEventListener('mouseenter', function() {
            this.style.opacity = '1';
        });
        github.addEventListener('click', function() {
            window.open("https://github.com/zhangboheng/Easy-Web-TV-M3u8");
        });
        github.addEventListener('mouseleave', function() {
            this.style.opacity = '0.5';
        });
    }
    
    //Set documents list
    var favorite = document.getElementById('favorite');
    if (favorite) {
        favorite.addEventListener('mouseenter', function() {
            this.style.opacity = '1';
        });
        favorite.addEventListener('click', function() {
            var channelist = document.getElementById('channelist');
            if (channelist.style.display === 'none' || !channelist.style.display) {
                channelist.style.display = 'block';
            } else {
                channelist.style.display = 'none';
            }
        });
        favorite.addEventListener('mouseleave', function() {
            this.style.opacity = '0.5';
        });
    }
    
    //Set shuffle play
    var shuffleplay = document.getElementById('shuffleplay');
    if (shuffleplay) {
        shuffleplay.addEventListener('mouseenter', function() {
            this.style.opacity = '1';
        });
        shuffleplay.addEventListener('mouseleave', function() {
            this.style.opacity = '0.5';
        });
    }
    
    //Set link input
    var inputlink = document.getElementById('inputlink');
    if (inputlink) {
        inputlink.addEventListener('mouseenter', function() {
            this.style.opacity = '1';
        });
        inputlink.addEventListener('mouseleave', function() {
            this.style.opacity = '0.5';
            var self = this;
            setTimeout(function() {
                self.style.display = 'none';
            }, 3000);
            var playerBtn = document.getElementById('player');
            if (playerBtn) {
                playerBtn.style.backgroundImage = 'url(../images/link.jpg)';
            }
        });
    }
});
