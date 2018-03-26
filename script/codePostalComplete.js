$(document).ready(function() {

  $("#onglets div").hide();
  $("#tableau, #liste").hide();

  $("#onglets div").on("click", function() {
    $(this).css("border", "2px solid grey");
    $("#onglets div").not(this).css("border", "2px solid white");
    $("#liste, #tableau").hide();
    $("#"+$(this).attr("value")).show();
  });

  var champCommune = "";
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
          if(data.length != 0){
            champCommune = data[0].Ville;
          }else{
            champCommune = "";
          }
          response(parse);
        },
        fail : function(){
          champCommune = "";
        }
      });
    },
    select : function(event, ui) {
      $("#onglets div").show();
      envoieRequette(ui.item.value, $("#nombreParPage").val());
      champCommune = ui.item.value;
    },
    change : function(event, ui) {
      $("#commune").val(champCommune);
    }
  });

  $("#nombreParPage").change(function(){
    envoieRequette($("#commune").val(), $("#nombreParPage").val());
    $("#onglets div").show();
  });

});

function envoieRequette(ville, nombre){
  $.ajax({
    url: "https://api.flickr.com/services/rest/",
    method: "GET",
    data: {
      method: "flickr.photos.search",
      api_key: "044417fb5b28b6ccb072373638d89bd4",
      // tags: ville,
      tags: "Paris",
      format: "json",
      nojsoncallback: "1",
      per_page: nombre
    },
    success: function(dataImg){
      $('#liste ul li').remove();
      $('#tableau table tr').remove();
      if($(dataImg).length != 0){
        $(dataImg.photos.photo).each(function(index, img){
          $.ajax({
            url: "https://api.flickr.com/services/rest/",
            method: "GET",
            data: {
              method: "flickr.photos.getInfo",
              api_key: "044417fb5b28b6ccb072373638d89bd4",
              format: "json",
              nojsoncallback: "1",
              photo_id: img.id,
              secret: img.secret
            },
            success: function(dataInfo){
              console.log(dataInfo);
              if($(dataInfo).length != 0){
                $(dataInfo).each(function(index, info){
                  $('ul').append('<li><img src="https://farm' + img.farm + '.staticflickr.com/' + img.server + '/' + img.id + '_' + img.secret + '.jpg"/></li>');
                  $('table').append('<tr><td><img src="https://farm' + img.farm + '.staticflickr.com/' + img.server + '/' + img.id + '_' + img.secret + '.jpg"/></td></tr>');
                });
              }else{
                $('ul').append("<li>Cette commune n'existe pas en France</li>");
                $('table').append("<tr><td>Cette commune n'existe pas en France</td></tr>");
              }
            }
          });
          $('ul').append('<li><img src="https://farm' + img.farm + '.staticflickr.com/' + img.server + '/' + img.id + '_' + img.secret + '.jpg"/></li>');
          $('table').append('<tr><td><img src="https://farm' + img.farm + '.staticflickr.com/' + img.server + '/' + img.id + '_' + img.secret + '.jpg"/></td></tr>');
        });
      }else{
        $('ul').append("<li>Cette commune n'existe pas en France</li>");
        $('table').append("<tr><td>Cette commune n'existe pas en France</td></tr>");
      }
    }
  });
}
