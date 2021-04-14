$(() => {
  // const covidMap = {
  //   type: "FeatureCollection",
  //   features: [],
  // };
  // Handler for .ready() called.
  const perc = function (a, b) {
    return (a / 100) * b;
  };
  // initializing linechart
  var linechart = initializeChart();
  // initializing mapbox
  var map = mapboxIntitialize();
  // initializing change theme function
  changeMapTheme(map);
  const worldCovid = {
    async: true,
    crossDomain: true,
    dataType: "json",
    url:
      "https://vaccovid-coronavirus-vaccine-and-treatment-tracker.p.rapidapi.com/api/npm-covid-data/world",
    method: "GET",
    headers: {
      "x-rapidapi-key": "a7a7c4254emsh1a4a646c1250948p177dd3jsn3a931bf71412",
      "x-rapidapi-host":
        "vaccovid-coronavirus-vaccine-and-treatment-tracker.p.rapidapi.com",
    },
  };

  $.ajax(worldCovid)
    .done(function (response) {
      $(".global_infected>span").text(
        convertBigNumbers(response[0].TotalCases)
      );
      $(".global_active>span").text(convertBigNumbers(response[0].ActiveCases));
      $(".global_deaths>span").text(convertBigNumbers(response[0].TotalDeaths));
      $(".global_recovered>span").text(
        convertBigNumbers(response[0].TotalRecovered)
      );
    })
    .fail((err) => {
      console.log(err);
      $(".modal-title").text(`Error`);
      $(".modal-body>p").text(
        `Error has occured while fetching world covid tally, world covid stats cannot be displayed.`
      );
      $(".err_box").modal("show");
      $(".global_case_wrapper").hide();
    });
  const countriesCovid = {
    async: true,
    crossDomain: true,
    dataType: "json",
    url:
      "https://vaccovid-coronavirus-vaccine-and-treatment-tracker.p.rapidapi.com/api/npm-covid-data/countries",
    method: "GET",
    headers: {
      "x-rapidapi-key": "a7a7c4254emsh1a4a646c1250948p177dd3jsn3a931bf71412",
      "x-rapidapi-host":
        "vaccovid-coronavirus-vaccine-and-treatment-tracker.p.rapidapi.com",
    },
  };

  $.ajax(countriesCovid)
    .done(function (response) {
      covidInfo(response);
      // mean of covid cases initialized
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
      })
        .done((countries) => {
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
        })
        .fail((err) => {
          console.log(err);
          $(".modal-title").text(`Error - ${err.statusText}`);
          $(".modal-body>p").text(
            `Error has occured while fetching countries longitudes and latitudes therefore map markers cannot be displayed.`
          );
          $(".err_box").modal("show");
        });
    })
    .fail((err) => {
      console.log(err);
      $(".modal-title").text(`Error`);
      $(".modal-body>p").text(
        `Error has occured while fetching countries covid info, Info bar and map markers cannot be displayed.`
      );
      $(".err_box").modal("show");
      $(".app_wrapper").css("visibility", "visible");
      $(".loader").css("display", "none");
      $(".info_bar").hide();
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
  if ($(window).width() >= 992) {
    // do your stuff
    map.on("load", function () {
      map.resize();
    });
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
              <h3 class="fs-4 d-flex justify-content-center">
              <span class="me-1"><img src="https://www.countryflags.io/${
                marker.TwoLetterSymbol
              }/flat/24.png">
              </span><span>${marker.Country}</span>
              </h3>
              <ul class="list-group list-group-flush">
  <li class="list-group-item text-info"  style="font-size: small;">Active Cases = ${convertBigNumbers(
    marker.ActiveCases
  )}</li>
  <li class="list-group-item text-info"  style="font-size: small;">Total Deaths = ${convertBigNumbers(
    marker.TotalDeaths
  )}</li>
  <li class="list-group-item text-info"   style="font-size: small;">Total Recovered = ${convertBigNumbers(
    marker.TotalRecovered
  )}</li>
</ul>
              
             
              
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
    } else if (
      ActiveCases >= covidCaseMean + perc(covidCaseMean, 20) &&
      ActiveCases < covidCaseMean - perc(covidCaseMean, 60)
    ) {
      el.style.height = "25px";
      el.style.width = "25px";
    } else if (ActiveCases >= covidCaseMean + perc(covidCaseMean, 60)) {
      el.style.height = "30px";
      el.style.width = "30px";
    } else if (
      ActiveCases <= covidCaseMean - perc(covidCaseMean, 20) &&
      ActiveCases > covidCaseMean - perc(covidCaseMean, 60)
    ) {
      el.style.height = "15px";
      el.style.width = "15px";
    } else if (ActiveCases <= covidCaseMean - perc(covidCaseMean, 60)) {
      el.style.height = "10px";
      el.style.width = "10px";
    }
  }
  function covidInfo(rank_countries) {
    let defs = [];
    let topCovidCountry = [];
    const settings = {
      async: true,
      crossDomain: true,
      dataType: "json",
      method: "GET",
      headers: {
        "x-rapidapi-key": "a7a7c4254emsh1a4a646c1250948p177dd3jsn3a931bf71412",
        "x-rapidapi-host":
          "vaccovid-coronavirus-vaccine-and-treatment-tracker.p.rapidapi.com",
      },
    };

    $(rank_countries).each((idx, country) => {
      if (idx == 7) return false;
      (settings.url = `https://vaccovid-coronavirus-vaccine-and-treatment-tracker.p.rapidapi.com/api/covid-ovid-data/sixmonth/${country.ThreeLetterSymbol}`),
        defs.push(
          $.ajax(settings).done(function (response) {
            response.TwoLetterSymbol = country.TwoLetterSymbol;
            topCovidCountry.push(response);
          })
        );
    });

    $.when(...defs)
      .done(function () {
        generateGraph(topCovidCountry, "us");
        $($(".date_toolbar>div").children("button").get().reverse()).each(
          function (idx, btn) {
            let d = topCovidCountry[0][idx].date;
            btn.value = d;
            d = d.substring(d.length - 2, d.length);
            if (d[0] == "0") d = d.substring(d.length - 1, d.length);
            btn.innerText = d;
          }
        );
        let date = topCovidCountry[0][0].date;
        let type = "total_cases";
        topCovidList(date, type, topCovidCountry);
        $(".date_toolbar>div")
          .children("button")
          .on("click", function () {
            date = this.value;
            topCovidList(date, type, topCovidCountry);
          });
        $(".type_covid_data")
          .children("input")
          .on("click", function () {
            type = this.value;
            topCovidList(date, type, topCovidCountry);
          });
        $(".app_wrapper").css("visibility", "visible");
        $(".loader").css("display", "none");
      })
      .fail((err) => {
        $(".modal-title").text(`Error`);
        $(".modal-body>p").text(
          `Error has occured while fetching countries covid info, Info bar cannot be displayed.`
        );
        $(".err_box").modal("show");
        $(".app_wrapper").css("visibility", "visible");
        $(".loader").css("display", "none");
        $(".info_bar").hide();
      });
  }

  function topCovidList(date, type, topCovidCountry) {
    let d = 0;
    $(topCovidCountry[0]).each((idx, count) => {
      if (count.date === date) {
        return false;
      }
      d++;
    });
    topCovidCountry.sort((a, b) => {
      return b[d][type] - a[d][type];
    });
    $(topCovidCountry).each((idx, country) => {
      $(`.covid_top_countries li:nth-child(${idx + 1})`)
        .html(
          `<span><img style="border-radius: 20px;" src="https://www.countryflags.io/${
            country.TwoLetterSymbol
          }/flat/24.png"></span>
        <span>${country[d].Country}</span>
        <span class="float-end">${convertBigNumbers(country[d][type])}</span>`
        )
        .on("click", function () {
          generateGraph(topCovidCountry, country.TwoLetterSymbol);
        });
    });
  }
  function generateGraph(data, isoCode) {
    let totalCase = [];
    let date = [];
    let newcases = [];
    let totaldeaths = [];
    $(data).each((idx, obj) => {
      if (obj.TwoLetterSymbol == isoCode) {
        linechart.options.plugins.title.text = obj[0].Country;
        $(obj).each((idx, o) => {
          if (idx == 7) return false;

          totalCase.push(o.total_cases);
          let d = o.date;
          d = d.substring(d.length - 2, d.length);
          if (d[0] == "0") d = d.substring(d.length - 1, d.length);
          date.push(d);
          newcases.push(o.new_cases);
          totaldeaths.push(o.total_deaths);
        });
        return false;
      }
    });
    totalCase.reverse();
    date.reverse();
    newcases.reverse();
    totaldeaths.reverse();
    linechart.data.labels = date;
    linechart.data.datasets[0].data = totalCase;
    linechart.data.datasets[1].data = totaldeaths;
    linechart.data.datasets[2].data = newcases;
    linechart.update();
  }
  function initializeChart() {
    var ctx = document.getElementById("myChart").getContext("2d");
    var lineChart = new Chart(ctx, {
      type: "line",
      data: {
        labels: [],
        datasets: [
          {
            label: "Total Cases",
            data: [],
            borderColor: "blue",
            lineTension: 0,
            borderWidth: 2,
            backgroundColor: "white",
            pointBackgroundColor: "white",
            pointHoverRadius: 5,
          },
          {
            label: "Total Deaths",
            data: [],
            borderColor: "red",
            lineTension: 0,
            borderWidth: 2,
            backgroundColor: "white",
            pointBackgroundColor: "white",
            pointHoverRadius: 5,
          },
          {
            label: "New Cases",
            data: [],
            borderColor: "green",
            lineTension: 0,
            borderWidth: 2,
            backgroundColor: "white",
            pointBackgroundColor: "white",
            pointHoverRadius: 5,
          },
        ],
      },
      options: {
        maintainAspectRatio: false,
        scales: {
          y: {
            // grid: {
            //   display: true,
            //   color: "black",
            // },
          },
          x: {
            // grid: {
            //   display: true,
            //   color: "black",
            // },
          },
        },
        plugins: {
          title: {
            display: true,
            color: "white",
            text: "Custom Chart Title",
            font: {
              size: 14,
            },
          },
        },
      },
    });
    return lineChart;
  }
});
