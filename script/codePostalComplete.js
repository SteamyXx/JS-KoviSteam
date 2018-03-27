$(document).ready(function() {


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
      if($("#nombreParPage").val() != ""){
        $("#onglets div").show();
        envoieRequette(ui.item.value, $("#nombreParPage").val());
      }
      champCommune = ui.item.value;
      $("#liste").show();
    },
    change : function(event, ui) {
      $("#commune").val(champCommune);
    }
  });

  $("#nombreParPage").change(function(){
    if($("#commune").val() != "" && $("#nombreParPage").val() != ""){
      envoieRequette($("#commune").val(), $("#nombreParPage").val());
      $("#onglets div").show();
    }
  });

  $('#boutonSubmit').click(function(event){
    event.preventDefault();
    if($("#commune").val() != "" && $("#nombreParPage").val() != ""){
      envoieRequette($("#commune").val(), $("#nombreParPage").val());
      $("#onglets div").show();
      $("#liste").show();
    }
  });

});

function envoieRequette(ville, nombre){
  $.ajax({
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
    success: function(dataImg){
      $('.ligneListe').remove();
      $('.ligneTableau').remove();
      if($(dataImg).length != 0){
        $(dataImg.photos.photo).each(function(index, img){
          $('ul').append('<li class="ligneListe"><img data-id="'+(img.id)+'" data-secret="'+(img.secret)+'" src="https://farm' + img.farm + '.staticflickr.com/' + img.server + '/' + img.id + '_' + img.secret + '.jpg"/></li>');
          $(".ligneListe img").on("click", function() {
            $(".modal").css("display", "initial");
            $(".modalUtil").css("display", "initial");
            remplirModal($(this).data("id"), $(this).data("secret"));
          });
          $('table').app
        });
      }else{
        $('ul').append("<li>Cette commune n'existe pas en France</li>");
        $('table').append("<tr><td>Cette commune n'existe pas en France</td></tr>");
      }
    }
  });


function remplirModal(id, secret) {
  $.ajax({
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
      console.log(dataInfo);
      $('#infos').html('<p>' + dataInfo.photo.title._content + '</p><p>' + dataInfo.photo.dates.taken + '</p><p>' + dataInfo.photo.owner.username + '</p>');
    }
  });
}


}
