$(document).ready(function() {

    $("#commune").autocomplete({
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
      }
  });
});
