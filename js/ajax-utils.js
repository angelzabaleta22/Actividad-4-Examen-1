(function (global) {
  // Establecer un espacio de nombres para nuestra utilidad
  var ajaxUtils = {};

  // Devuelve un objeto de petición HTTP
  function getRequestObject() {
    if (global.XMLHttpRequest) {
      return new XMLHttpRequest();
    } else if (global.ActiveXObject) {
      // Para navegadores IE muy antiguos (opcional)
      return new ActiveXObject("Microsoft.XMLHTTP");
    } else {
      global.alert("Ajax is not supported!");
      return null;
    }
  }

  // Realiza una petición Ajax GET a 'requestUrl'
  ajaxUtils.sendGetRequest = function (
    requestUrl,
    responseHandler,
    isJsonResponse
  ) {
    var request = getRequestObject();
    request.onreadystatechange = function () {
      handleResponse(request, responseHandler, isJsonResponse);
    };
    request.open("GET", requestUrl, true);
    request.send(null);
  };

  // Sólo llama al 'responseHandler' proporcionado por el usuario
  // si la respuesta está lista
  // y no es un error
  function handleResponse(request, responseHandler, isJsonResponse) {
    if (request.readyState == 4 && request.status == 200) {
      // Por defecto isJsonResponse = true
      if (isJsonResponse == undefined) {
        isJsonResponse = true;
      }

      if (isJsonResponse) {
        responseHandler(JSON.parse(request.responseText));
      } else {
        responseHandler(request.responseText);
      }
    }
  }

  // Exponer utilidad al objeto global
  global.$ajaxUtils = ajaxUtils;
})(window);
