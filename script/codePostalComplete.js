$(document).ready(function() {

  // De base on considère que les onglets, le tableau et la liste sont cachés
  $("#onglets").hide();
  $("#onglets div").hide();
  $("#tableau, #liste").hide();

  // Initialisation du calendrier
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


  // Fonction permettant de faire disparaître la fenêtre modal lors d'un clique sur la croix
  $(".croix").on("click", function() {
    $(".modal").css("display", "none");
    $(".modalUtil").css("display", "none");
  });

  // Fonciton permettant d'afficher le tableau ou la liste en fonction de l'onglet cliqué
  $("#onglets div").on("click", function() {
    $(this).css("border", "0.3vh solid #CCC");
    $("#onglets div").not(this).css("border", "0.3vh solid #2A2F38");
    $("#liste, #tableau").hide();
    $("#"+$(this).attr("value")).show();
  });

  // Fonction permettant récupèrer les données de la ville saisie via la fonction envoieRequette() lors d'un clique sur le bouton "Rechercher"
  // si tous les champs sont spécifiés
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

  // Fonction permettant l'autocomplétion lors du saisie de la ville
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
        success : function(data) { // on parse les données renvoyées par la requete ajax pour que l'affichage des villes soit correct
          var parse = data.map(function(ligne) {
            return {
              label : ligne.Ville,
              value : ligne.Ville,
            };
          });
          if (data.length != 0) {
            champCommune = data[0].Ville;
          } else {
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
    select : function(event, ui) { // Lorsqu'une ville est sélectionnée, on récupère les données via la fonction envoieRequette()
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

// Cette fonction est appelée à chaque fois qu'un requète ajax s'est terminé correctement
// Ici le but est de compter le nombre de requête ajax terminé pour être sur de créer ou mettre à jour notre dataTable
$( document ).ajaxComplete(function() {
  nbrAjaxDone++;
  if (nbrAjaxDone-1 == nbrImage) {// Si on a récupéré les informations de toutes les photos
    if (!dataTable) {// Et qu'on a pas déjà créé notre datatable
      dataTable = true;
      table = $("#table").dataTable({// on créé notre dataTable à partir du tableau data
        data : data
      });
    } else {// si on l'a déja créé, on met juste à jour les données contenu dans la table
      table.fnClearTable();
      if (typeof data !== 'undefined' && data.length > 0) {
        table.fnAddData(data);
      }
    }
  }
});

/** Fonction permettant d'envoyer plusieurs requètes ajax dans le but de récupérer les photos
*   et leurs informations en concordance avec les paramètres précisés
*   @param string ville, la ville choisit par l'utilisateur
*   @param int nombre, le nombre de photos à récupérer
*   @param string date, la date minimum à laquelle les photos doivent avoir été posté
*/
function envoieRequette(ville, nombre, date){
  data = [];
  nbrAjaxDone = 0;
  $.ajax({ // Requête ajax récupérant les photos en concordance avec les paramètres précisés
    url: "https://api.flickr.com/services/rest/",
    method: "GET",
    data: {
      method: "flickr.photos.search",
      api_key: "044417fb5b28b6ccb072373638d89bd4",
      format: "json",
      nojsoncallback: "1",
      tags: ville,
      per_page: nombre,
      min_upload_date: Math.round((date).getTime() / 1000)
    },
    success: function(dataImg){
      $('.ligneListe').remove();
      $('.ligneTableau').remove();
      if($(dataImg.photos.photo).length != 0){
        nbrImage = $(dataImg.photos.photo).length;// on sauvegarde le nombre d'image récupéré pour savoir quand mettre à jour notre dataTable (voir fonction plus haut)
        // Pour chaque photo on met à jour la liste, on récupère les informations la concernant que l'on stock dans le tableau data
        $(dataImg.photos.photo).each(function(index, img){
          $('#liste ul').append('<li class="ligneListe"><img data-id="'+(img.id)+'" data-secret="'+(img.secret)+'" src="https://farm' + img.farm + '.staticflickr.com/' + img.server + '/' + img.id + '_' + img.secret + '.jpg"/></li>');
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
            }
          });
        });
      } else {// Si aucune photo n'a été récupéré, on affiche un fenêtre modal d'erreur
        $(".modal").css("display", "initial");
        $(".modalUtil").css("display", "initial");
        $('#infos').data("id", 0);
        $('#infos').html("<p>Aucune image n'est disponible pour cette ville</p>");
      }
    }
  });
}

/** Permet de remplir la fenêtre modal avec les informations concernant une photo
* @param string id, l'identifiant de la photo
* @param string secret, clé permettant de ne pas spammer l'api
*/
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
