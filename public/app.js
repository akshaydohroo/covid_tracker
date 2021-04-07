$(() => {
  // Handler for .ready() called.
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
  mapboxgl.accessToken =
    "pk.eyJ1IjoiYWtzaGF5ZG9ocm9vIiwiYSI6ImNrbjZndm4zMTBlNWIyb254cWgwZDBmaTkifQ.KZSDfJsYgYFGE9mWgHl3mA";
  var map = new mapboxgl.Map({
    container: "map",
    style: "mapbox://styles/mapbox/dark-v10",
  });
  var menuThemesMap = $('#menu>input');
  console.log(menuThemesMap);
  function switchLayer(layer) {
  var layerId = layer.target.id;
  map.setStyle('mapbox://styles/mapbox/' + layerId);
  }
   
  for (var i = 0; i < menuThemesMap.length; i++) {
  menuThemesMap[i].onclick = switchLayer;
  }
  

  $.ajax(countriesCovid).done(function (response) {
    console.log(response);
    let countriesCovidFree = countriesWithoutCovid(response);
    $(".global_countries>span").text(
      response.length - countriesCovidFree.length
    );
    $.ajax({
        url: "./latLongCountries.json",
        dataType: "json",
      }).done((countries)=>{
        console.log(countries);
        $(response).map((i,res)=>{
            if(countries[res.TwoLetterSymbol]){
                res.latitude = countries[res.TwoLetterSymbol].lat;
                res.longitude = countries[res.TwoLetterSymbol].long;
            }
        })
        console.log(response);
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
});
