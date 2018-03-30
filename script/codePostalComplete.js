$(document).ready(function() {

  $("#onglets div:first-child").css("border", "2px solid grey");

  $(".croix").on("click", function() {
    $(".modal").css("display", "none");
    $(".modalUtil").css("display", "none");
  });

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
      if($("#nombreParPage").val() != "" && $('#calendrier').val() != ""){
        envoieRequette(ui.item.value, $("#nombreParPage").val());
      }
      champCommune = ui.item.value;
    },
    change : function(event, ui) {
      $("#commune").val(champCommune);
    }
  });

  $("#nombreParPage").change(function(){
    if($("#commune").val() != "" && $("#nombreParPage").val() != "" && $('#calendrier').val() != ""){
      envoieRequette($("#commune").val(), $("#nombreParPage").val());

    }
  });

  $('#boutonSubmit').click(function(event){
    event.preventDefault();
    if($("#commune").val() != "" && $("#nombreParPage").val() != "" && $('#calendrier').val() != ""){
      envoieRequette($("#commune").val(), $("#nombreParPage").val());
      $("#liste").show();
    }
  });

});

function envoieRequette(ville, nombre, date){
  $.ajax({
    url: "https://api.flickr.com/services/rest/",
    method: "GET",
    data: {
      method: "flickr.photos.search",
      api_key: "044417fb5b28b6ccb072373638d89bd4",
      tags: ville,
      format: "json",
      nojsoncallback: "1",
      per_page: nombre,
      min_taken_date: date
    },
    success: function(dataImg){
      $('.ligneListe').remove();
      $('.ligneTableau').remove();
      if($(dataImg.photos.photo).length != 0){
        $(dataImg.photos.photo).each(function(index, img){
          $('ul').append('<li class="ligneListe"><img data-id="'+(img.id)+'" data-secret="'+(img.secret)+'" src="https://farm' + img.farm + '.staticflickr.com/' + img.server + '/' + img.id + '_' + img.secret + '.jpg"/></li>');
          $(".ligneListe img").on("click", function() {
            if ($('#infos').data("id") != $(this).data("id")) {
              remplirModal($(this).data("id"), $(this).data("secret"));
            } else {
              $(".modal").css("display", "initial");
              $(".modalUtil").css("display", "initial");
            }
          });
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
              $('table').append('<tr class="ligneTableau"><td><img src="https://farm' + img.farm + '.staticflickr.com/' + img.server + '/' + img.id + '_' + img.secret + '.jpg"/></td><td>' + dataInfo.photo.title._content + '</td><td>' + dataInfo.photo.dates.taken + '</td><td>' + dataInfo.photo.owner.username + '</td></tr>');
            }
          });
        });
        $("#onglets div").show();
        $("#liste").show();
      }else{
        $(".modal").css("display", "initial");
        $(".modalUtil").css("display", "initial");
        $('#infos').data("id", 0);
        $('#infos').html("<p>Aucune image n'est disponible pour cette ville</p>");
      }
    }
  });



function remplirModal(id, secret) {
  var getInfo = $.ajax({
    url: "https://api.flickr.com/services/rest/",
    method: "GET",
    data: {
      method: "flickr.photos.getInfo",
      api_key: "044417fb5b28b6ccb072373638d89bd4",
      format: "json",
      nojsoncallback: "1",
      photo_id: id,
      secret: secret
    },
    success: function(dataInfo){
      $('#infos').data("id", id);
      $('#infos').html('<p>' + dataInfo.photo.title._content + '</p><p>' + dataInfo.photo.dates.taken + '</p><p>' + dataInfo.photo.owner.username + '</p>');
    }
  });
  $.when(getInfo).then(function() {
    $(".modal").css("display", "initial");
    $(".modalUtil").css("display", "initial");
  })
}


}
