
var PaymillStats = {
  _data: {
    currency: {},
    income: {}
  },
  _graphs: {
    currency: null,
  },
  _theme: {
    chart: {
      backgroundColor: 'rgba(0, 0, 0, 0)',
      spacingLeft: 20,
      spacingRight: 20,
    },
    title: {
      text: null
    },
    plotOptions: {
      series: {
        animation: false,
        shadow: false
      },
      pie: {
        borderColor: null
      }
    },
    xAxis: {
      lineColor: "#707070"
    },
    yAxis: {
      lineColor: "#707070",
      gridLineColor: "#707070",
      labels: {
        enabled: false
      },
      title: {
        text: null
      }
    },
    credits: {
      enabled: false
    },
    legend: {
      enabled: false
    },
    colors: ["#00abe2", "#58c34c", "#d9ce29", "#e75849", "#ef912a"]
  },

  addTransaction: function (transaction) {
    var c = transaction.currency, d = transaction.date;

    // Update the currency
    if (!PaymillStats._data.currency.hasOwnProperty(c)) {
      PaymillStats._data.currency[c] = 0;
    }
    PaymillStats._data.currency[c] += parseInt(transaction.amount);

    // Update the income graph
    if (!PaymillStats._data.income.hasOwnProperty(c)) {
      PaymillStats._data.income[c] = {};
    }

    if (!PaymillStats._data.income[c].hasOwnProperty(d)) {
      PaymillStats._data.income[c][d] = 0;
    }

    PaymillStats._data.income[c][d] += parseInt(transaction.amount);
  }
};

$(function() {

  // Connect with Pusher
  Pusher.log = function(message) {
    if (window.console && window.console.log) window.console.log(message);
  };

  WEB_SOCKET_DEBUG = true;
  var pusher = new Pusher('4abac1993bfa36f917e2'),
      channel = pusher.subscribe('paymill_graphs');

  // Bindings
  channel.bind('transaction_received', function(transaction) {

    // Add an event to the table
    $("#events tbody .none").hide();
    $("#events tbody").prepend("<tr>" +
                        "<td>" + transaction.date + "</td>" +
                        "<td>" + transaction.amount + "</td>" +
                        "<td>" + transaction.currency + "</td>" +
                        "<td>" + transaction.card_type + "</td>" +
                        "</tr>");
    $("#events tbody tr:eq(5)").remove();

    // Update the graphs
    PaymillStats.addTransaction(transaction);
  });

  // Load the graphs initially
  channel.bind('pusher:subscription_succeeded', function() {
    $(".wrapper").removeClass("loading");
    $(".main-container").removeClass("hidden");

    setInterval(function() {
      _updateGraphs();
    }, 1000);
    _updateGraphs();
  });
});

function _updateGraphs () {

  // Currency pie chart
  var currency_series = {
    type: "pie",
    data: []
  }, sum = 0;

  // Sum all the currencies
  for (c in PaymillStats._data.currency) {
    sum += parseInt(PaymillStats._data.currency[c]);
  }

  // Generate the series
  for (c in PaymillStats._data.currency) {
    currency_series.data.push([c, (sum * 100) / PaymillStats._data.currency[c]]);
  }

  PaymillStats._graphs.currency = new Highcharts.Chart(Highcharts.merge({
    chart: {
      renderTo: $("#currency-graph").get(0),
      height: 200
    },
    series: [currency_series],
  }, PaymillStats._theme));

  // Income line graph
  var income_series = [];

  // Format the income values
  for (c in PaymillStats._data.income) {
    var s = {
      type: "line",
      data: []
    };

    for (i in PaymillStats._data.income[c]) {
      s.data.push([i*1000, PaymillStats._data.income[c][i]]);
    }

    income_series.push(s);
  }

  PaymillStats._graphs.income = new Highcharts.Chart(Highcharts.merge(PaymillStats._theme, {
    chart: {
      renderTo: $("#income-graph").get(0),
      height: 250
    },
    xAxis: {
      type: "datetime"
    },
    series: income_series,
  }));
};
