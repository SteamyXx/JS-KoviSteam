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
<<<<<<< HEAD
  var photos = $.ajax({
=======
  $.ajax({
>>>>>>> ff6864c8336b42fc1e6eaab9d0c99d7f63bd7c7c
    url: "https://api.flickr.com/services/rest/",
    method: "GET",
    data: {
      method: "flickr.photos.search",
      api_key: "044417fb5b28b6ccb072373638d89bd4",
      tags: ville,
      format: "json",
      nojsoncallback: "1",
      per_page: nombre
    },
<<<<<<< HEAD
    succes : function(data){
      $('#liste li').remove();
      if($(data).length != 0){
        $(data.photos.photo).each(function(index, val){
          $('ul').append('<li><img src="https://farm' + val.farm + '.staticflickr.com/' + val.server + '/' + val.id + '_' + val.secret + '.jpg"/></li>');
        });
      }else{
        $('ul').append("<li>Cette commune n'existe pas en France</li>");
      }
    }
  });

  // var infoPhotos = $.ajax({
  //   url: "https://api.flickr.com/services/rest/",
  //   method: "GET",
  //   data: {
  //     method: "flickr.photos.getInfo",
  //     secret: val.secret
  //   },
  //   succes : function(data){
  //     $('#liste li').remove();
  //     if($(data).length != 0){
  //       $(data.photos.photo).each(function(index, val){
  //         $('ul').append('<li><img src="https://farm' + val.farm + '.staticflickr.com/' + val.server + '/' + val.id + '_' + val.secret + '.jpg"/></li>');
  //       });
  //     }else{
  //       $('ul').append("<li>Cette commune n'existe pas en France</li>");
  //     }
  //   }
  // });



=======
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
              $('ul').append('<li><img src="https://farm' + img.farm + '.staticflickr.com/' + img.server + '/' + img.id + '_' + img.secret + '.jpg"/></li>');
              $('table').append('<tr><td><img src="https://farm' + img.farm + '.staticflickr.com/' + img.server + '/' + img.id + '_' + img.secret + '.jpg"/></td></tr>');
            }
          });
        });
      }else{
        $('ul').append("<li>Cette commune n'existe pas en France</li>");
        $('table').append("<tr><td>Cette commune n'existe pas en France</td></tr>");
      }
    }
  });
>>>>>>> ff6864c8336b42fc1e6eaab9d0c99d7f63bd7c7c
}
