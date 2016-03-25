(function(root) {
	'use strict';
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
                $('.times-up').html(toTime(played));
                $('.times-down').html("-" + toTime(total - played));
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
        sta: '.play-percent',
        title: '.palyer_musicName',
        artist: '.palyer_musicAuthor',
        cover: '.player_musicSmallIcon',
        play: {
            'DOM': '#player_start',
            'fn': function() {
                $('#player_start').hide();
                $('#player_stop').show();
            }
        },
        stop: {
            'DOM': '#player_stop',
            'fn': function() {
                $('#player_stop').hide();
                $('#player_start').show();
            }
        }
    });
})(window);


$(function() {
	'use strict';
	var $W_W = $(window).width(),
	$W_H = $(window).height();
	
	$('.wrapper').height( $W_H );
	
	if($W_H > 568){
		$('.block-checkin').css({'marginTop': ($W_H - 568) + 77 + 'px'});
	}
	
	$('.msg-close').click(function(e) {
        var box = $(this).closest('.msg-box').fadeOut();
    });
	
	$('#player_start').click(function(e) {
        $('#player_start').css({'display':'none'});
        $('#player_stop').css({'display':'block'});
    });
	$('#player_stop').click(function(e) {
        $('#player_start').css({'display':'block'});
        $('#player_stop').css({'display':'none'});
    });
	
	var music = player;
	
	music.addMusic([musicInfo]);

});