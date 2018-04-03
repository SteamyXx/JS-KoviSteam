$(document).ready(function() {

  $("#calendrier").datepicker({
    altField: "#datepicker",
    closeText: 'Fermer',
    prevText: 'Précédent',
    nextText: 'Suivant',
    currentText: 'Aujourd\'hui',
    monthNames: ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'],
    monthNamesShort: ['Janv.', 'Févr.', 'Mars', 'Avril', 'Mai', 'Juin', 'Juil.', 'Août', 'Sept.', 'Oct.', 'Nov.', 'Déc.'],
    dayNames: ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'],
    dayNamesShort: ['Dim.', 'Lun.', 'Mar.', 'Mer.', 'Jeu.', 'Ven.', 'Sam.'],
    dayNamesMin: ['D', 'L', 'M', 'M', 'J', 'V', 'S'],
    weekHeader: 'Sem.',
    dateFormat: 'dd-mm-yy',
    firstDay: 1,
  });
  $("#calendrier").datepicker('setDate', 'today');

  $(".croix").on("click", function() {
    $(".modal").css("display", "none");
    $(".modalUtil").css("display", "none");
  });

  $("#onglets div").hide();
  $("#tableau, #liste").hide();
  $("#tableau, #onglets").hide();

  $("#onglets div").on("click", function() {
    $(this).css("border", "0.3vh solid #CCC");
    $("#onglets div").not(this).css("border", "0.3vh solid #2A2F38");
    $("#liste, #tableau").hide();
    $("#"+$(this).attr("value")).show();
  });

  $('#boutonSubmit').click(function(event){
    event.preventDefault();
    if($("#commune").val() != "" && $("#nombreParPage").val() != ""){
      envoieRequette($("#commune").val(), $("#nombreParPage").val(), $("#calendrier").datepicker("getDate"));
      if (!$("#liste").is(":visible") && !$("#tableau").is(":visible")) {
        $("#onglets div").show();
        $("#onglets").show();
        $("#tableau").hide();
        $("#liste").show();
        $("#formatListe").css("border-color", "#CCC");
        $("#formatTableau").css("border-color", "#2A2F38");
      }
    }
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
          console.log("fail");
          champCommune = "";
        }
      });
    },
    select : function(event, ui) {
      if($("#nombreParPage").val() != "" && $('#calendrier').val() != ""){
        envoieRequette(ui.item.value, $("#nombreParPage").val(), $("#calendrier").datepicker("getDate"));
        $("#liste, #onglets").show();
        $("#onglets div").show();
      }
      champCommune = ui.item.value;
    },
    change : function(event, ui) {
      $("#commune").val(champCommune);
    }
  });
});

var data = [];
var nbrImage = 0;
var nbrAjaxDone = 0;
var dataTable = false;
var table = null;
$( document ).ajaxComplete(function() {
  nbrAjaxDone++;
  if (nbrAjaxDone-1 == nbrImage) {
    if (!dataTable) {
      dataTable = true;
      table = $("#table").dataTable({
        data : data
      });
    } else {
      table.fnClearTable();
      if (typeof data !== 'undefined' && data.length > 0) {
        table.fnAddData(data);
      }
    }
  }
});

function envoieRequette(ville, nombre, date){
  data = [];
  nbrAjaxDone = 0;
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
      min_upload_date: Math.round((date).getTime() / 1000)
    },
    success: function(dataImg){
      $('.ligneListe').remove();
      $('.ligneTableau').remove();
      if($(dataImg.photos.photo).length != 0){
        nbrImage = $(dataImg.photos.photo).length;
        console.log("nbrImage : "+nbrImage);
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
              data.push([
                '<img src="https://farm' + img.farm + '.staticflickr.com/' + img.server + '/' + img.id + '_' + img.secret + '.jpg"/>',
                dataInfo.photo.title._content,
                dataInfo.photo.dates.taken,
                dataInfo.photo.owner.username
            ]);
              // $('table tbody').append('<tr class="ligneTableau"><td></td><td>' + dataInfo.photo.title._content + '</td><td>' + dataInfo.photo.dates.taken + '</td><td>' + dataInfo.photo.owner.username + '</td></tr>');
            }
          });
        });
      } else {
        $(".modal").css("display", "initial");
        $(".modalUtil").css("display", "initial");
        $('#infos').data("id", 0);
        $('#infos').html("<p>Aucune image n'est disponible pour cette ville</p>");
      }
    }
  });
}


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
