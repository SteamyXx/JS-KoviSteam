$(document).ready(function() {

    $("#commune").autocomplete({
      // var tmp = this["bindings"][0]["attributes"]["id"]["value"];
      source: function(request, response) {
        $.ajax({
          url : "http://infoweb-ens/~jacquin-c/codePostal/commune.php",
          method : "GET",
          data : {
            commune : request.term
          },
          success : function(data) {
            var parse = data.map(function(ligne) {
              return {
                label : ligne.CodePostal+"  "+ligne.Ville,
                value : (tmp == "commune") ? ligne.Ville : ligne.CodePostal,
              };
            });
            response(parse);
          }
        });
      },
      select: function(event, ui) {
        $("#codePostal").val(ui.item["oth"]);
        $("#commune").val(ui.item["oth"]);
      }
  });
});

function afficherCodePostal(communeStr) {
  var ajax = $.ajax({
    url : "codePostal.php",
    method : "GET",
    data : {
      commune : communeStr
    }
  });
  ajax.done(function(data) {
    $(".liste ul li").remove();
    if ($(data).length != 0) {
      $(data).each(function(index, val) {
        $(".liste ul").append("<li>"+val.CP+"; "+val.CODEPAYS+"</li>");
      })
    }
  });
  ajax.fail(function() {
    console.log("Erreur retour ajax");
  });
}
