$(() => {
  // const covidMap = {
  //   type: "FeatureCollection",
  //   features: [],
  // };
  // Handler for .ready() called.
  const perc = function (a, b) {
    return (a / 100) * b;
  };
  // initializing mapbox
  var map = mapboxIntitialize();
  // initializing change theme function
  changeMapTheme(map);
  const worldCovid = {
    async: true,
    crossDomain: true,
    url:
      "https://vaccovid-coronavirus-vaccine-and-treatment-tracker.p.rapidapi.com/api/npm-covid-data/world",
    method: "GET",
    headers: {
      "x-rapidapi-key": "a7a7c4254emsh1a4a646c1250948p177dd3jsn3a931bf71412",
      "x-rapidapi-host":
        "vaccovid-coronavirus-vaccine-and-treatment-tracker.p.rapidapi.com",
    },
  };

  $.ajax(worldCovid).done(function (response) {
    console.log(response);
    $(".global_infected>span").text(convertBigNumbers(response[0].TotalCases));
    $(".global_active>span").text(convertBigNumbers(response[0].ActiveCases));
    $(".global_deaths>span").text(convertBigNumbers(response[0].TotalDeaths));
    $(".global_recovered>span").text(
      convertBigNumbers(response[0].TotalRecovered)
    );
  });
  const countriesCovid = {
    async: true,
    crossDomain: true,
    url:
      "https://vaccovid-coronavirus-vaccine-and-treatment-tracker.p.rapidapi.com/api/npm-covid-data/countries",
    method: "GET",
    headers: {
      "x-rapidapi-key": "a7a7c4254emsh1a4a646c1250948p177dd3jsn3a931bf71412",
      "x-rapidapi-host":
        "vaccovid-coronavirus-vaccine-and-treatment-tracker.p.rapidapi.com",
    },
  };

  $.ajax(countriesCovid).done(function (response) {
    // mean of covid cases initialized
    console.log(response);
    let covidCaseMean = 0;
    // countries in global case wrapper value set
    let countriesCovidFree = countriesWithoutCovid(response);
    $(".global_countries>span").text(
      response.length - countriesCovidFree.length
    );
    // adding latitudes and longitudes in my response object for mapbox
    $.ajax({
      url: "./latLongCountries.json",
      dataType: "json",
    }).done((countries) => {
      $(response).map((i, res) => {
        if (countries[res.TwoLetterSymbol]) {
          res.latitude = parseFloat(countries[res.TwoLetterSymbol].lat);
          res.longitude = parseFloat(countries[res.TwoLetterSymbol].long);
          covidCaseMean += res.ActiveCases;
        }
      });
      // taking mean of all the covid cases i can find of countries
      covidCaseMean =
        covidCaseMean / (response.length - countriesCovidFree.length);

      addingMarkers(map, response, covidCaseMean);
    });
  });

  function countriesWithoutCovid(data) {
    let countries = [];
    $(data).each((idx, country) => {
      if (country.ActiveCases == 0) {
        countries.push(country);
      }
    });
    return countries;
  }

  function convertBigNumbers(labelValue) {
    // Nine Zeroes for Billions
    return Math.abs(Number(labelValue)) >= 1.0e9
      ? (Math.abs(Number(labelValue)) / 1.0e9).toFixed(2) + "B"
      : // Six Zeroes for Millions
      Math.abs(Number(labelValue)) >= 1.0e6
      ? (Math.abs(Number(labelValue)) / 1.0e6).toFixed(2) + "M"
      : // Three Zeroes for Thousands
      Math.abs(Number(labelValue)) >= 1.0e3
      ? (Math.abs(Number(labelValue)) / 1.0e3).toFixed(2) + "K"
      : Math.abs(Number(labelValue));
  }
  function jsonToGeojson(json, geojson) {
    // Json to geojson convert
    // $(json).each((idx, country) => {
    //   if (!country.latitude) {
    //     return true;
    //   }
    //   covidMap.features.push({
    //     type: "Feature",
    //     geometry: {
    //       type: "Point",
    //       coordinates: [country.longitude, country.latitude],
    //     },
    //     properties: {
    //       ActiveCases: country.ActiveCases,
    //       TotalDeaths: country.TotalDeaths,
    //       TotalRecovered: country.TotalRecovered,
    //       TotalTests: country.TotalTests,
    //       TwoLetterSymbol: country.TwoLetterSymbol,
    //     },
    //   });
    // });
  }
  function mapboxIntitialize(params) {
    mapboxgl.accessToken =
      "pk.eyJ1IjoiYWtzaGF5ZG9ocm9vIiwiYSI6ImNrbjZndm4zMTBlNWIyb254cWgwZDBmaTkifQ.KZSDfJsYgYFGE9mWgHl3mA";
    let map = new mapboxgl.Map({
      container: "map",
      style: "mapbox://styles/mapbox/dark-v10",
      center: [0, 0],
      zoom: 1,
    });
    return map;
  }
  function changeMapTheme(map) {
    var menuThemesMap = $("#menu>input");
    function switchLayer(layer) {
      var layerId = layer.target.id;
      map.setStyle("mapbox://styles/mapbox/" + layerId);
    }

    for (var i = 0; i < menuThemesMap.length; i++) {
      menuThemesMap[i].onclick = switchLayer;
    }
  }
  function addingMarkers(map, response, covidCaseMean) {
    $(response).each(function (idx, marker) {
      // create a HTML element for each feature
      if (!marker.latitude) {
        return true;
      }
      var el = document.createElement("div");
      el.className = "marker";

      sizeAndColorDetermineMarker(marker.ActiveCases, covidCaseMean, el);

      // make a marker for each feature and add it to the map
      new mapboxgl.Marker(el)
        .setLngLat([marker.longitude, marker.latitude])
        .setPopup(
          new mapboxgl.Popup({ offset: 25 }) // add popups

            .setHTML(
              `
              <h3 class="display-6">
              ${marker.Country}
              </h3><p class="fs-6"> 
              Active Cases -> ${convertBigNumbers(marker.ActiveCases)}
              <br> 
              Total Deaths -> ${convertBigNumbers(marker.TotalDeaths)}
              <br>
              Total Recovered -> ${convertBigNumbers(marker.TotalRecovered)} 
              </p>
              
              `
            )
        )
        .addTo(map);
    });
  }
  function sizeAndColorDetermineMarker(ActiveCases, covidCaseMean, el) {
    if (
      ActiveCases < covidCaseMean + perc(covidCaseMean, 20) &&
      ActiveCases > covidCaseMean - perc(covidCaseMean, 20)
    ) {
      el.style.height = "15px";
      el.style.width = "15px";
      el.style.backgroundColor = "#FFFF00";
    } else if (
      ActiveCases >= covidCaseMean + perc(covidCaseMean, 20) &&
      ActiveCases < covidCaseMean - perc(covidCaseMean, 60)
    ) {
      el.style.height = "25px";
      el.style.width = "25px";
      el.style.backgroundColor = "#FFFF00";
    } else if (ActiveCases >= covidCaseMean + perc(covidCaseMean, 60)) {
      el.style.height = "30px";
      el.style.width = "30px";
      el.style.backgroundColor = "#FF0000";
    } else if (
      ActiveCases <= covidCaseMean - perc(covidCaseMean, 20) &&
      ActiveCases > covidCaseMean - perc(covidCaseMean, 60)
    ) {
      el.style.height = "15px";
      el.style.width = "15px";
      el.style.backgroundColor = "#7FFF00";
    } else if (ActiveCases <= covidCaseMean - perc(covidCaseMean, 60)) {
      el.style.height = "10px";
      el.style.width = "10px";
      el.style.backgroundColor = "#00FF00";
    }
  }
});
