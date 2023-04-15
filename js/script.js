$(function () {
  $("#navbarToggle").blur(function (event) {
    var screenWidth = window.innerWidth;
    if (screenWidth < 768) {
      $("#collapsable-nav").collapse("hide");
    }
  });

  /*   En Firefox y Safari, el evento click no retiene el foco
 en el botón pulsado. Por lo tanto, el evento blur no se disparará cuando
 si el usuario hace clic en otro lugar de la página y el manejador del evento blur
  que está configurado arriba no será llamado.
  Consulte el problema #28 en el repositorio.
   Solución: forzar el foco en el elemento en el que se disparó el evento click */

  $("#navbarToggle").click(function (event) {
    $(event.target).focus();
  });
});

(function (global) {
  var dc = {};

  var homeHtml = "snippets/home-snippet.html";
  var allCategoriesUrl =
    "https://coursera-jhu-default-rtdb.firebaseio.com/categories.json";
  var categoriesTitleHtml = "snippets/categories-title-snippet.html";
  var categoryHtml = "snippets/category-snippet.html";
  var menuItemsUrl =
    "https://coursera-jhu-default-rtdb.firebaseio.com/menu_items/";
  var menuItemsTitleHtml = "snippets/menu-items-title.html";
  var menuItemHtml = "snippets/menu-item.html";

  // Función de conveniencia para insertar innerHTML para 'select"
  var insertHtml = function (selector, html) {
    var targetElem = document.querySelector(selector);
    targetElem.innerHTML = html;
  };

  // Mostrar icono de carga dentro de elemento identificado por 'selector'
  var showLoading = function (selector) {
    var html = "<div class='text-center'>";
    html += "<img src='images/ajax-loader.gif'></div>";
    insertHtml(selector, html);
  };

  // Devolver sustituto de '{{propName}}''
  // con propValue en la 'string' dada
  var insertProperty = function (string, propName, propValue) {
    var propToReplace = "{{" + propName + "}}";
    string = string.replace(new RegExp(propToReplace, "g"), propValue);
    return string;
  };

  // Elimina la clase 'active' de home y cambia al botón Menú
  var switchMenuToActive = function () {
    // Eliminar 'activo' del botón de inicio
    var classes = document.querySelector("#navHomeButton").className;
    classes = classes.replace(new RegExp("active", "g"), "");
    document.querySelector("#navHomeButton").className = classes;

    // Añadir 'activo' al botón de menú si no está ya ahí
    classes = document.querySelector("#navMenuButton").className;
    if (classes.indexOf("active") == -1) {
      classes += " active";
      document.querySelector("#navMenuButton").className = classes;
    }
  };

  // Al cargar la página (antes de imágenes o CSS)
  document.addEventListener("DOMContentLoaded", function (event) {
    // En la primera carga, mostrar vista de inicio
    showLoading("#main-content");
    $ajaxUtils.sendGetRequest(
      homeHtml,
      function (responseText) {
        document.querySelector("#main-content").innerHTML = responseText;
      },
      false
    );
  });

  // Cargar la vista de categorías del menú
  dc.loadMenuCategories = function () {
    showLoading("#main-content");
    $ajaxUtils.sendGetRequest(allCategoriesUrl, buildAndShowCategoriesHTML);
  };

  // Cargar la vista de elementos de menú
  // 'categoryShort' es un nombre_corto para una categoría
  dc.loadMenuItems = function (categoryShort) {
    showLoading("#main-content");
    $ajaxUtils.sendGetRequest(
      menuItemsUrl + categoryShort + ".json",
      buildAndShowMenuItemsHTML
    );
  };

  // Construye HTML para la página de categorías basándose en los datos
  // del servidor
  function buildAndShowCategoriesHTML(categories) {
    // Cargar fragmento de título de la página de categorías
    $ajaxUtils.sendGetRequest(
      categoriesTitleHtml,
      function (categoriesTitleHtml) {
        // Recuperar un fragmento de categoría
        $ajaxUtils.sendGetRequest(
          categoryHtml,
          function (categoryHtml) {
            // Cambiar la clase CSS activa al botón de menú
            switchMenuToActive();

            var categoriesViewHtml = buildCategoriesViewHtml(
              categories,
              categoriesTitleHtml,
              categoryHtml
            );
            insertHtml("#main-content", categoriesViewHtml);
          },
          false
        );
      },
      false
    );
  }

  // Usar datos de categorías y fragmentos html
  // construir vista de categorías HTML para ser insertado en la página
  function buildCategoriesViewHtml(
    categories,
    categoriesTitleHtml,
    categoryHtml
  ) {
    var finalHtml = categoriesTitleHtml;
    finalHtml += "<section class='row'>";

    // Recorrer las categorías
    for (var i = 0; i < categories.length; i++) {
      // Insertar valores de categoría
      var html = categoryHtml;
      var name = "" + categories[i].name;
      var short_name = categories[i].short_name;
      html = insertProperty(html, "name", name);
      html = insertProperty(html, "short_name", short_name);
      finalHtml += html;
    }

    finalHtml += "</section>";
    return finalHtml;
  }

  // Construye HTML para la página de categoría única basándose en los datos
  // del servidor
  function buildAndShowMenuItemsHTML(categoryMenuItems) {
    // Cargar fragmento de título de la página de elementos de menú
    $ajaxUtils.sendGetRequest(
      menuItemsTitleHtml,
      function (menuItemsTitleHtml) {
        // Recuperar fragmento de elemento de menú único
        $ajaxUtils.sendGetRequest(
          menuItemHtml,
          function (menuItemHtml) {
            // Cambiar la clase CSS activa al botón de menú
            switchMenuToActive();

            var menuItemsViewHtml = buildMenuItemsViewHtml(
              categoryMenuItems,
              menuItemsTitleHtml,
              menuItemHtml
            );
            insertHtml("#main-content", menuItemsViewHtml);
          },
          false
        );
      },
      false
    );
  }

  // Usar datos de categoría y elementos de menú y fragmentos html
  // construir la vista de elementos de menú HTML para insertar en la página
  function buildMenuItemsViewHtml(
    categoryMenuItems,
    menuItemsTitleHtml,
    menuItemHtml
  ) {
    menuItemsTitleHtml = insertProperty(
      menuItemsTitleHtml,
      "name",
      categoryMenuItems.category.name
    );
    menuItemsTitleHtml = insertProperty(
      menuItemsTitleHtml,
      "special_instructions",
      categoryMenuItems.category.special_instructions
    );

    var finalHtml = menuItemsTitleHtml;
    finalHtml += "<section class='row'>";

    // Recorrer los elementos del menú
    var menuItems = categoryMenuItems.menu_items;
    var catShortName = categoryMenuItems.category.short_name;
    for (var i = 0; i < menuItems.length; i++) {
      // Insertar valores de elementos de menú
      var html = menuItemHtml;
      html = insertProperty(html, "short_name", menuItems[i].short_name);
      html = insertProperty(html, "catShortName", catShortName);
      html = insertItemPrice(html, "price_small", menuItems[i].price_small);
      html = insertItemPortionName(
        html,
        "small_portion_name",
        menuItems[i].small_portion_name
      );
      html = insertItemPrice(html, "price_large", menuItems[i].price_large);
      html = insertItemPortionName(
        html,
        "large_portion_name",
        menuItems[i].large_portion_name
      );
      html = insertProperty(html, "name", menuItems[i].name);
      html = insertProperty(html, "description", menuItems[i].description);

      // Añadir clearfix después de cada segundo elemento de menú
      if (i % 2 != 0) {
        html +=
          "<div class='clearfix visible-lg-block visible-md-block'></div>";
      }

      finalHtml += html;
    }

    finalHtml += "</section>";
    return finalHtml;
  }

  // Añade el precio con '$' si el precio existe
  function insertItemPrice(html, pricePropName, priceValue) {
    // Si no se especifica, se sustituye por una cadena vacía
    if (!priceValue) {
      return insertProperty(html, pricePropName, "");
    }

    priceValue = "$" + priceValue.toFixed(2);
    html = insertProperty(html, pricePropName, priceValue);
    return html;
  }

  // Añade el nombre de la porción entre paréntesis si existe
  function insertItemPortionName(html, portionPropName, portionValue) {
    // Si no se especifica, devuelve la cadena original
    if (!portionValue) {
      return insertProperty(html, portionPropName, "");
    }

    portionValue = "(" + portionValue + ")";
    html = insertProperty(html, portionPropName, portionValue);
    return html;
  }

  global.$dc = dc;
})(window);
