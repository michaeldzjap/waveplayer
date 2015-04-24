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
      $listItems.removeClass('active');
      $(this).addClass('active');

      var urls = $currItem.nextAll().addBack().map(function() { return this.href; }).get();
      waveplayer.schedulePlaylist({
        urls: urls,
        onStart: function() {
          waveplayer.un('ended');
          if (typeof startPlayback === 'undefined') {
            waveplayer.play();
            play = true;
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
          play = false;
          $icon.removeClass('glyphicon-pause').addClass('glyphicon-play');
          waveplayer.on('ended', function() {
            play = false;
            $icon.removeClass('glyphicon-pause').addClass('glyphicon-play');
          });
        }
      });

      e.preventDefault();
    });
    $listItems.first().trigger('click', false);


    /*
     * Might need another solution here: what if audio has not loaded yet???
     * Could use 'playlistqueued' event, but would have to remove/rebind on every new
     * event in order to avoid storing multiple identical click event handlers in
     * waveplayer's mediator object.
     */
    // click handler for play-pause button
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

    // click handler for when user clicks on waveform view
    waveplayer.on('waveclickplay', function() {
      play = !play;
      $icon.removeClass('glyphicon-play').addClass('glyphicon-pause');
    });

  });

})(jQuery);
