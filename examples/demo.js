(function($) {
  $(document).ready(function() {
    var $listItems = $('.list-group-item'), $icon = $('#play-pause-icon');;

    // create a new waveplayer.js instance
    var waveplayer = new WavePlayer({
      container: '#waveform',
      barWidth: 4,
      barGap: 1,
      height: 128
    });

    // schedule a new playlist on menu item click
    var play = false;
    $listItems.click(function(e) {
      var $currItem = $(this), startPlayback = arguments[1];
      waveplayer.cancelPlaylist();    // cancel the current playlist
      $listItems.removeClass('active');
      $(this).addClass('active');

      var urls = $currItem.nextAll().addBack().map(function() { return this.href; }).get();
      waveplayer.schedulePlaylist({
        urls: urls,
        onStart: function() {
          if (typeof startPlayback === 'undefined') {
            waveplayer.play();
            $icon.removeClass('glyphicon-play').addClass('glyphicon-pause');
          }
        },
        onChange: function() {
          var $currItem = $listItems.filter('.active');
          var $nextItem = $currItem.next();
          if ($nextItem.attr('href')) {
            $currItem.removeClass('active');
            $nextItem.addClass('active');
          }
        },
        onEnd: function() {
          waveplayer.pause();
          $icon.removeClass('glyphicon-pause').addClass('glyphicon-play');
        }
      });

      e.preventDefault();
    });
    $listItems.first().trigger('click', false);

    waveplayer.on('canplay', function() {
      $('#play-pause').click(function(e) {
        play = !play;
        if (play) {
          waveplayer.play();
          $icon.removeClass('glyphicon-play').addClass('glyphicon-pause');
        } else {
          waveplayer.pause();
          $icon.removeClass('glyphicon-pause').addClass('glyphicon-play');
        }
      });
    });

  });

})(jQuery);
