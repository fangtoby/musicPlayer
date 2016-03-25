(function(root) {
    'use strict';
    //the init funciton
    function player(obj) {
        var Player = this;
        Player.param = obj;
        Player.musicList = [];
        Player.musicIndex = 0;
        Player.status = 'loading';
        Player.fnStack = [];
        //the mode of the player , it can be big modle or small mode
        Player.mode = 'small';
        Player.now = {};

        //create a new player
        Player.Obj = $('<div class="player"></div>');
        $('body').append(Player.Obj);

        Player.Obj.jPlayer({
            swfPath: '',
            supplied: 'm4a,oga,mp3',
            //cssSelectorAncestor: '#jp_container_1',
            ready: function() {
                //play event
                $(Player.param.play.DOM).on('click', function() {
                    Player.play();
                });
                //pause event
                $(Player.param.stop.DOM).on('click', function() {
                    Player.pause();
                });

                //drop event
                var touchX = 0;
                $('.player_progress_handle').on('touchstart', function(e) {
                    Player.status = 'touching';
                });
                $('.player_progress_handle').on('touchmove', function(e) {
                    touchX = e.originalEvent.touches[0].pageX;
                    if (e.originalEvent.touches[0].pageX < 0) {
                        touchX = 0;
                    } else if (e.originalEvent.touches[0].pageX > document.documentElement.clientWidth - 18) {
                        touchX = document.documentElement.clientWidth - 18;
                    }
                    $(this).css({
                        'left': touchX
                    });
                    return false;
                });
                $('.player_progress_handle').on('touchend', function(e) {
                    var present = touchX / document.documentElement.clientWidth;
                    Player.play(present);
                    $('.player_progress').css({
                        'width': present * 100 + '%'
                    });
                    Player.status = 'playing';
                });

                //play previous 
                $('.playerB_contorl_prev').on('click', function() {
                    if (--Player.musicIndex < 0) {
                        Player.musicIndex = 0;
                    } else {
                        Player.play();
                    }
                });

                //play next
                $('.playerB_contorl_next').on('click', function() {
                    var total = Player.musicList.length;
                    if (++Player.musicIndex >= total) {
                        Player.musicIndex = total - 1;
                    } else {
                        Player.play();
                    }
                });

                Player.status = 'loaded';
                var stackFn = Player.fnStack.shift();
                while (stackFn) {
                    stackFn();
                    stackFn = Player.fnStack.shift();
                }

                //
                $('.playerB_back').on('click', function() {
                    $('.player_musicBig').hide();
                    $('.player_musicMini').show();
                    return false;
                });

                $('.player_musicSwitch').on('click', function() {
                    $('.player_musicBig').show();
                    $('.player_musicMini').hide();
                    return false;
                });

            },
            play: function() {
                $(Player.param.title).html(Player.now.title);
                $(Player.param.artist).html(Player.now.artist);
                $(Player.param.cover).attr('src', Player.now.cover || 'img/nocover.jpg');
                $('.playerB_cover').attr('xlink:href', Player.now.cover || 'img/nocover.jpg');
                $('.palyer_musicSchool').html(Player.now.school || '--');
                $('.palyer_musicLove').html(Player.now.love || 0);
                if (Player.now.origin) {
                    $('.player_musicType').show();
                } else {
                    $('.player_musicType').hide();
                }

                if (Player.param.play.fn) Player.param.play.fn.apply(Player.param, arguments);

            },
            pause: function() {
                if (Player.param.stop.fn) Player.param.stop.fn.apply(Player.param, arguments);
            },
            ended: function() {
                var total = Player.musicList.length;
                if (++Player.musicIndex >= total) {
                    Player.musicIndex = total - 1;
                    Player.pause();
                } else {
                    Player.play();
                }
            },
            timeupdate: function() {
                var ply = $(this);
                var total = ply.data('jPlayer').status.duration;
                var played = ply.data('jPlayer').status.currentTime;

                function toTime(timeStamp) {
                    var second = parseInt(timeStamp);
                    var showSecond = second % 60;
                    showSecond = showSecond < 10 ? '0' + showSecond : showSecond;
                    var showMin = parseInt(second / 60) % 60;
                    showMin = showMin < 10 ? '0' + showMin : showMin;
                    var result = showMin + ':' + showSecond;
                    return result;
                }
                $('.playerB_player_timeGrey').html(toTime(total));
                $('.playerB_player_timeNowNumber').html(toTime(played));
                var progress = played / total * 100 + '%';
                $(Player.param.sta).css({
                    'width': progress
                });
                if (Player.status !== 'touching') {
                    $('.player_progress_handle').css({
                        'left': progress
                    });
                }

            }
        });

        function resize() {
            var BPlayerWidth = $('.playerB_player').width();
            var BPlayerHeight = $('.playerB_player').height();
            var useWidth = Math.min(BPlayerWidth, BPlayerHeight) - 20;
            $('#PlayerBox').css({
                'width': useWidth,
                'height': useWidth,
                'top': (BPlayerHeight - useWidth) / 2
            });

            $('.playerB_player_time').css({
                'bottom': BPlayerHeight - useWidth
            });

            //big modle's control size
            var boxWidth = $('.playerB_control').width() / 5;
            var boxHeight = $('.playerB_control').height();
            var useWidth = Math.min(boxWidth, boxHeight);

            var startHeight = useWidth * 0.3;
            $('.playerB_contorl_start,.playerB_contorl_share').css({
                'height': startHeight,
                'marginTop': (boxHeight - startHeight) / 2
            });

            var nextHeight = (useWidth - 20) * 0.5;
            $('.playerB_contorl_prev,.playerB_contorl_next').css({
                'height': nextHeight,
                'width': nextHeight,
                'marginTop': (boxHeight - nextHeight - 20) / 2,
                'border-radius': nextHeight + 20 * 0.5
            });

            var playHeight = useWidth * 0.8 - 10;
            $('.playerB_contorl_pause,.playerB_contorl_play').css({
                'height': playHeight,
                'width': playHeight,
                'border-radius': playHeight,
                'marginTop': (boxHeight - playHeight - 20) / 2
            });
        }
        //TODO:fix big modle
        setTimeout(function() {
            resize();
        }, 0);
        setTimeout(function() {
            resize();
        }, 1000);

        $(window).on('resize', function() {
            resize();
        })

    }

    player.prototype.addMusic = function(obj) {
        var player = this;

        if (obj instanceof Array) {
            for (var i = 0; i < obj.length; i++) {
                add(obj[i]);
            }
        } else {
            add(obj);
        }

        function add(obj) {
            if (player.status == 'loading') {
                player.fnStack.push(function() {
                    player.musicList.push(obj);
                });
            } else {
                player.musicList.push(obj);
            }
        }


    };

    player.prototype.removeMusic = function(obj) {
        console.warn(obj);
    };

    player.prototype.pause = function() {
        var player = this;
        if (player.status == 'loading') {
            player.fnStack.push(function() {
                player.Obj.jPlayer('pause');
                player.status = 'ready';
            });
        } else {
            player.Obj.jPlayer('pause');
            player.status = 'ready';
        }
        $('.playerB_player').removeClass('playerB_player_run');
    };

    player.prototype.play = function(time) {

        var player = this;
        var playTime;
        if (time) {
            playTime = player.Obj.data('jPlayer').status.duration * time;
        } else {
            playTime = null;
        }

        player.now = player.musicList[player.musicIndex];

        var isThisMusic = (player.Obj.data('jPlayer').status.media.artist == player.now.artist) && (player.Obj.data('jPlayer').status.media.title == player.now.title)

        if (player.status == 'loading') {
            player.fnStack.push(function() {
                if (!isThisMusic) {
                    player.Obj.jPlayer('setMedia', player.now);
                    var bgIndex = player.now.title.charCodeAt(0) % 7;
                    $('.player_musicBig').css({
                        'background-image': 'url("img/bg00' + bgIndex + '.jpg")'
                    })
                }
                player.Obj.jPlayer('play', playTime);
                player.status = 'playing';
            });
        } else {
            if (!isThisMusic) {
                player.Obj.jPlayer('setMedia', player.now);
                var bgIndex = player.now.title.charCodeAt(0) % 7;
                $('.player_musicBig').css({
                    'background-image': 'url("img/bg00' + bgIndex + '.jpg")'
                })
            }
            player.Obj.jPlayer('play', playTime);
            player.status = 'playing';
        }
        $('.playerB_player').addClass('playerB_player_run');
    };


    root.player = new player({
        sta: '.player_progress',
        title: '.palyer_musicName',
        artist: '.palyer_musicAuthor',
        cover: '.player_musicSmallIcon',
        play: {
            'DOM': '.player_minContro_play,.playerB_contorl_play',
            'fn': function() {
                $('.player_minContro_stop').css('top', '50%');
                $('.player_minContro_play').css('top', '-100%');
                $('.playerB_contorl_play').hide();
                $('.playerB_contorl_pause').show();
            }
        },
        stop: {
            'DOM': '.player_minContro_stop,.playerB_contorl_pause',
            'fn': function() {
                $('.player_minContro_stop').css('top', '-100%');
                $('.player_minContro_play').css('top', '50%');
                $('.playerB_contorl_pause').hide();
                $('.playerB_contorl_play').show();
            }
        }
    });
})(window);




$(function() {
    var music = player;

    // music.addMusic({
    //     'artist': '陈奕迅',
    //     'title': '猜情寻',
    //     'mp3': 'http://ichangge-player-music.qiniudn.com/mp3/%E9%99%88%E5%A5%95%E8%BF%85-%E7%8C%9C%E6%83%85%E5%AF%BB.mp3',
    //     'oga': 'http://ichangge-player-music.qiniudn.com/ogg/%E9%99%88%E5%A5%95%E8%BF%85-%E7%8C%9C%E6%83%85%E5%AF%BB.ogg',
    //     'school': '上海交通大学',
    //     'cover': 'http://img001.photo.21cn.com/photos/album/20080313/o/0EAD28886F082686DA74A2B8829B86E5.jpg'
    // });

    music.addMusic([{
        "artist": "庞麦郎",//作者
        "title": "我的滑板鞋",//标题
        "mp3": "http://ichangge-player-music.qiniudn.com/mp3/%E5%BA%9E%E9%BA%A6%E9%83%8E-%E6%88%91%E7%9A%84%E6%BB%91%E6%9D%BF%E9%9E%8B.mp3",
        //"oga": "http://ichangge-player-music.qiniudn.com/ogg/%E5%BA%9E%E9%BA%A6%E9%83%8E-%E6%88%91%E7%9A%84%E6%BB%91%E6%9D%BF%E9%9E%8B.ogg",
        "cover": "http://www.zgfznews.com/fznews/yule/yinyue/images/2014711368386.jpg",//封面
        "love": 1234,//赞数
        "id": 123,//歌曲id
        "origin": true,//是否原创
    }, {
        "artist": "beyond",
        "title": "我是愤怒",
        "mp3": "http://ichangge-player-music.qiniudn.com/mp3/beyond-%E6%88%91%E6%98%AF%E6%84%A4%E6%80%92.mp3",
        //"oga": "http://ichangge-player-music.qiniudn.com/ogg/beyond-%E6%88%91%E6%98%AF%E6%84%A4%E6%80%92.ogg",
        "love": 2234
    }, {
        "artist": "陈奕迅",
        "title": "猜情寻",
        "mp3": "http://ichangge-player-music.qiniudn.com/mp3/%E9%99%88%E5%A5%95%E8%BF%85-%E7%8C%9C%E6%83%85%E5%AF%BB.mp3",
        //"oga": "http://ichangge-player-music.qiniudn.com/ogg/%E9%99%88%E5%A5%95%E8%BF%85-%E7%8C%9C%E6%83%85%E5%AF%BB.ogg",
        "cover": "http://img001.photo.21cn.com/photos/album/20080313/o/0EAD28886F082686DA74A2B8829B86E5.jpg",
        "love": 31234
    }, {
        "artist": "Maroon 5",
        "title": "Maps",
        "mp3": "http://ichangge-player-music.qiniudn.com/mp3/Maroon5-Maps.mp3",
        //"oga": "http://ichangge-player-music.qiniudn.com/ogg/Maroon5-Maps.ogg",
        "love": 41234
    }, {
        "artist": "林宥嘉",
        "title": "我总是一个人在练习一个人",
        "mp3": "http://ichangge-player-music.qiniudn.com/mp3/%E6%9E%97%E5%AE%A5%E5%98%89-%E6%88%91%E6%80%BB%E6%98%AF%E4%B8%80%E4%B8%AA%E4%BA%BA%E5%9C%A8%E7%BB%83%E4%B9%A0%E4%B8%80%E4%B8%AA%E4%BA%BA.mp3",
        //"oga": "http://ichangge-player-music.qiniudn.com/ogg/%E6%9E%97%E5%AE%A5%E5%98%89-%E6%88%91%E6%80%BB%E6%98%AF%E4%B8%80%E4%B8%AA%E4%BA%BA%E5%9C%A8%E7%BB%83%E4%B9%A0%E4%B8%80%E4%B8%AA%E4%BA%BA.ogg"
    }]);

});