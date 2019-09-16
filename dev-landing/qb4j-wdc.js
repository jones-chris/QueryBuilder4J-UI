(function () {
    var myConnector = tableau.makeConnector();

    var jsonData = {
        "name": "NullFilter",
        "databaseType": "Sqlite",
        "columns": [
          "county_spending_detail.fiscal_year",
          "county_spending_detail.amount",
          "county_spending_detail.service"
        ],
        "table": "county_spending_detail",
        "criteria": [
          // {
          //   "id": 0,
          //   "conjunction": "And",
          //   "column": "county_spending_detail.department",
          //   "operator": "isNull",
          //   "filter": null,
          //   "endParenthesis": []
          // }
        ],
        "joins": [],
        "distinct": false,
        "groupBy": false,
        "orderBy": false,
        "ascending": false,
        "suppressNulls": false,
        "subQueries": {},
        "criteriaArguments": {},
        "criteriaParameters": []
      };

    myConnector.getSchema = function (schemaCallback) {
      // var cols = [{
      //   id: "id",
      //   dataType: "tableau.dataTypeEnum.string"
      // }, {
      //   id: "mag",
      //   alias: "magnitude",
      //   dataType: tableau.dataTypeEnum.float
      // }, {
      //   id: "title",
      //   alias: "title",
      //   dataType: tableau.dataTypeEnum.string
      // }, {
      //   id: "location",
      //   dataType: tableau.dataTypeEnum.geometry
      // }];

      // var tableSchema = {
      //   id: "earthquakeFeed",
      //   alias: "Earthquakes with magnitude greater than 4.5 in the last seven days",
      //   columns: cols
      // };

      // schemaCallback([tableSchema]);

      // var jsonData = {
      //     "columns": [
      //       "county_spending_detail.fiscal_year",
      //       "county_spending_detail.amount",
      //       "county_spending_detail.service"
      //     ]
      //   };

      $.ajax({
        type: "POST",
        url: "http://localhost:8080/tableau-wdc-types",
        contentType: "application/json",
        data: JSON.stringify({
          "columns": jsonData.columns
        }),
        dataType: 'json',
        success: function(resp){
          console.log('inside GET schema callback');
          var tableSchema = resp;
          schemaCallback([tableSchema]);
        }
      });

    };

    myConnector.getData = function (table, doneCallback) {
      $.ajax({
        type: "POST",
        url: "http://localhost:8080/query",
        contentType: "application/json",
        data: JSON.stringify(jsonData),
        dataType: 'json',
        success: function(resp){
          console.log('inside getData callback');
          
          var data = JSON.parse(resp.queryResults[0]);
          var tableData = [];
          for (var i=0; i<data.length; i++) {
            tableData.push(
              data[i]
              // jsonData.columns[0].split('.')[1]: data[i].fiscal_year,
              // jsonData.columns[1].split('.')[1]: data[i].amount,
              // jsonData.columns[2].split('.')[1]: data[i].service
              // "fiscal_year": data[i].fiscal_year,
              // "amount": data[i].amount,
              // "service": data[i].service

            );
          }

          table.appendRows(tableData);
          doneCallback();
        }
      });

      // $.getJSON("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_week.geojson", function(resp) {
      //   var feat = resp.features,
      //       tableData = [];

      //   // Iterate over the JSON object
      //   for (var i = 0, len = feat.length; i < len; i++) {
      //       tableData.push({
      //           "id": feat[i].id,
      //           "mag": feat[i].properties.mag,
      //           "title": feat[i].properties.title,
      //           "location": feat[i].geometry
      //       });
      //   }

      //   table.appendRows(tableData);
      //   doneCallback();
      // });
    };

    tableau.registerConnector(myConnector);

    $(document).ready(function () {
      $("#submitButton").click(function () {
        tableau.connectionName = "qb4j test";
        tableau.submit();
      });
    });

})();
