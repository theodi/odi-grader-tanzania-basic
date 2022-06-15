import validJson from 'is-my-json-valid'
import $ from "cash-dom"
import CsvToJson from "csvtojson";
import tableToJson from "html-table-to-json"
import similarity from "similarity";
import Darkmode from 'darkmode-js';


const options = {
  time: '0.5s', // default: '0.3s',
  backgroundColorLight: '#005086',
  label: '🌓',
  // change position to top right corner
  bottom: '44px', // default: '32px'
  right: 'unset', // default: '32px'
  left: '32px', // default: 'unset'
}
const darkmode = new Darkmode(options);
darkmode.showWidget();

let best = [{
  "region": "Mara",
  "facility type": "Hospital",
  "ownership": "Public",
  "name of facility": "BUTIAMA HOSPITAL",
  "star rating": "2"
}];

document.getElementById("import").onclick = function () {
  // empty array where we will store stringified json
  let arr;
  // finding imported file
  let files = document.getElementById("selectFiles").files;
  if (files.length <= 0) {
    return false;
  }
  let fr = new FileReader();
  //load csv and convert to JSON
  fr.onload = function (e) {
    //console.log('fetching file'); //ok
    CsvToJson()
      .fromString(e.target.result)
      .then((arr) => {
        let input = arr;
        console.log(arr); // not ok, no values
        var col = [];
        for (var i = 0; i < input.length; i++) {
          for (var key in input[i]) {
            //console.log('key in input: ', key); //ok
            if (col.indexOf(key) === -1) {
              col.push(key);
              //console.log('col', col); //ok
            }
          }
        }
        // CREATE DYNAMIC TABLE.
        var table = document.createElement("table");
        //set table id
        table.setAttribute('id', 'table');
        // table.addClass('table');
        // CREATE HTML TABLE HEADER ROW USING THE EXTRACTED HEADERS ABOVE.
        var tr = table.insertRow(-1);                   // TABLE ROW.
        for (var i = 0; i < col.length; i++) {
          var th = document.createElement("th");      // TABLE HEADER.
          th.innerHTML = col[i];
          tr.appendChild(th);
        }
        // ADD JSON DATA TO THE TABLE AS ROWS.
        for (var i = 0; i < input.length; i++) {
          tr = table.insertRow(-1);
          for (var j = 0; j < col.length; j++) {
            var tabCell = tr.insertCell(-1);
            tabCell.innerHTML = input[i][col[j]];
          }
        }
        // FINALLY ADD THE NEWLY CREATED TABLE WITH JSON DATA TO A CONTAINER.
        var divContainer = document.getElementById("result");
        divContainer.innerHTML = "";
        divContainer.appendChild(table);
        let counter = 0;
        let editedVersion
        document.getElementById("result").addEventListener("input", function () {
          console.log("input event fired");
          // log the new table header
          editedVersion = table
          counter += 1
          //console.log(counter)
          const updatedTable = tableToJson.parse(table.outerHTML)
          editedVersion = updatedTable.results
          console.log(editedVersion)
        }, false);

        let gradeTotal = 0

        function checkStars(input) {
          let allStars = [];
          for (let i of input) {
            for (let key in i) {
              if (key === 'star rating') {
                allStars.push(parseInt(i[key]))
              }
            }
          }
          console.log('allStars', allStars);
          if (allStars.length > 0) {
            let sumStars = allStars.reduce((a, b) => a + b, 0);
            let displayTotal = `Sum of stars: ${sumStars}`;
            let meanStars = sumStars/allStars.length;
            function median(values){
              if(values.length ===0) throw new Error("No inputs");
              values.sort(function(a,b){
                return a-b;
              });
              var half = Math.floor(values.length / 2);
              if (values.length % 2) return values[half];
              return (values[half - 1] + values[half]) / 2.0;
            }
            let medStars = median(allStars);
            let starType = typeof(sumStars);
            console.log('sum, mean, median: ', sumStars, meanStars, medStars);
            if (sumStars === 394 && meanStars === 1.2236024844720497 && medStars === 1) {
              $("#starRatings").text("✅ Star ratings are numeric and agree with our calcuations. Two points awarded.");
              gradeTotal += 2
              console.log('points: ', gradeTotal);
            }
            else if (isNaN(sumStars)) {
              $("#starRatings").text("✏️ Star ratings could not be analysed. No points awarded.");
              gradeTotal += 0
              console.log('points: ', gradeTotal);
            }
            else if (sumStars != 394 && starType == "number") {
              $("#starRatings").text("✏️ Star ratings do not agree with our analysis. Only one point awarded.");
              gradeTotal += 1
              console.log('points: ', gradeTotal);
            }

          }
        }
        checkStars(input);

      function checkTypes(input) {
        let allTypes = [];
        for (let i of input) {
          for (let key in i) {
            //console.log(key);
            if (key === 'facility type') {
              allTypes.push(i[key])
            }
          }
        }
        //console.log('allTypes', allTypes);
        function countUnique(iterable) {
          return new Set(iterable);
        }
        let listTypes = countUnique(allTypes);
        let numTypes = listTypes.size;
        console.log('Types', listTypes, numTypes);
        if (numTypes === 3) {
          $("#facTypes").text("✅  There are 3 distinct facility types in the dataset. One point awarded.");
          gradeTotal += 1
          console.log('points: ', gradeTotal);
        }
      }
      checkTypes(input);

      function checkRegions(input) {
        let allRegions = [];
        for (let i of input) {
          for (let key in i) {
            //console.log(key);
            if (key === 'region') {
              allRegions.push(i[key])
            }
          }
        }
        //console.log('allRegions', allRegions);
        function countUnique(iterable) {
          return new Set(iterable);
        }
        let listRegions = countUnique(allRegions);
        let numRegions = listRegions.size;
        console.log('Regions', listRegions, numRegions);
        if (numRegions === 2) {
          $("#regions").text("✅  There are 2 distinct regions in the dataset. One point awarded.");
          gradeTotal += 1
          console.log('points: ', gradeTotal);
        }
      }
      checkRegions(input);

      function checkRows(input) {
        let allRows = [];
        let numRows = input.length;
        console.log('numRows', numRows);
        if (numRows === 322) {
          $("#rows").text("✅  There are 322 rows in the dataset. One point awarded.");
          gradeTotal += 1
          console.log('points: ', gradeTotal);
        }
      }
      checkRows(input);


//Convert to lower case and sort for easier checking of headers
        let found = [];
        let keysUsed = Object.keys(input[0]).map(i => i.toLowerCase()).sort()
        let keysRecommended = Object.keys(best[0]).map(i => i.toLowerCase()).sort()

// Remove anything containing the word "of", "the", "facility", or "health"
        const removeWords = (arr) => {
          return arr.map((string) =>
            string.replace(/of|the|facility|health|/g, "").trim()
          );
        };

        const baseArr = removeWords(keysRecommended);
        const userArr = removeWords(keysUsed);

        let maxGrade = 5
        let gradePC = gradeTotal/maxGrade*100;
        let gradeRounded = gradePC.toFixed(1);
        let gradeText = `You scored a total of ${gradeTotal} out of a possible ${maxGrade}. Your grade is ${gradeRounded}%`;
        $("#totalGrade").text(gradeText);

      })


  }
  fr.readAsText(files.item(0));
};
