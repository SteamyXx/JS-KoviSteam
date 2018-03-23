$(document).ready(function() {

  $("#onglets div").hide();

  $("#onglets div").on("click", function() {
    $(this).css("border", "2px solid grey")
    $("#onglets div").not(this).css("border", "2px solid white")
    $("#liste, #tableau").hide();
    $("#"+$(this).attr("value")).show();
  });

  $("#commune").autocomplete({
    minLength: 2,
    source: function(request, response) {
      $.ajax({
        url : "http://infoweb-ens/~jacquin-c/codePostal/commune.php",
        method : "GET",
        data : {
          commune : request.term,
          maxRows : 15
        },
        success : function(data) {
          var parse = data.map(function(ligne) {
            return {
              label : ligne.Ville,
              value : ligne.Ville,
            };
          });
          response(parse);
        }
      });
    },
    select : function(event, ui) {
      $("#onglets div").show();
      var ajax = $.ajax({
        url: "https://api.flickr.com/services/rest/",
        method: "GET",
        data: {
          method: "flickr.photos.search",
          api_key: "044417fb5b28b6ccb072373638d89bd4",
          tags: ui.item.value,
          format: "json",
          nojsoncallback: "1",
          per_page: $("#nombreParPage").val()
        }
      });
      ajax.done(function(data){
        $('#liste li').remove();
        if($(data).length != 0){
          $(data.photos.photo).each(function(index, val){
            $('ul').append('<li><img src="https://farm' + val.farm + '.staticflickr.com/' + val.server + '/' + val.id + '_' + val.secret + '.jpg"/></li>');
          });
        }else{
          $('ul').append("<li>Cette commune n'existe pas en France</li>");
        }
      });
    }
  });

  $("#submit").click(function(){

  });

});
