
function toStr(elementId) {
  return document.getElementById(elementId)?.value.trim();
}

function fetchPostInfoArrival() {
  var postcode = toStr("postcodeArrival");

  fetch(`https://api.basisregisters.dev-vlaanderen.be/v1/postinfo/${postcode}`)
      .then(response => response.json())
      .then(data => {
          var cityDropdown = document.getElementById("addressSearch");
          cityDropdown.innerHTML = "";

          if (data && data.postnamen) {
              data.postnamen.forEach(postname => {
                  var option = document.createElement("option");
                  option.value = postname.geografischeNaam.spelling;
                  option.text = postname.geografischeNaam.spelling;
                  cityDropdown.add(option);
              });
          }
      })
      .catch(error => {
          console.error("Error fetching postinfo:", error);
      });
}


document.getElementById("carForm").addEventListener("submit", function(event) {
  event.preventDefault();

  var carBrand = toStr("carBrand");
  var carModel = toStr("carModel");
  var carColor = toStr("carColor");
  var carPlate = toStr("carPlate");

  var transmission = document.querySelector('input[name="transmission"]:checked')?.value;
  var fuelType = document.querySelector('input[name="fuelType"]:checked')?.value;

  var customerName = toStr("customerName");
  var phoneNumber = toStr("phoneNumber");

  var buildingTypeRadio = document.querySelector('input[name="buildingType"]:checked');
  var buildingType = buildingTypeRadio && buildingTypeRadio?.value === "other" ? document.getElementById("otherBuildingText")?.value.trim() : buildingTypeRadio ? buildingTypeRadio?.value.trim() : "";

  var street = toStr("street");
  var number = toStr("number");
  var cityStart = toStr("postcodeAndCity");
  
  var [postcodeStart, ...cityParts] = cityStart.split(' ');
  var cityStartName = cityParts.join(' ');

  var streetArrival = toStr("streetArrival");
  var numberArrival = toStr("numberArrival");
  var cityArrival = toStr("cityArrival");

  var [postcodeArrival, ...cityParts] = cityArrival.split(' ');
  var cityArrivalName = cityParts.join(' ');

  var comments = toStr("comments");

  var generatedText = 
`*Feestvierder:*
${customerName}
${phoneNumber}

*Gegevens wagen:*
${carBrand} ${carModel}
${carPlate}
Kleur: ${carColor}
Type schakeling: ${transmission}
Type brandstof: ${fuelType}

*Startpunt:*
Type gebouw: ${buildingType}
${street} ${number}
${cityStart}
https://maps.google.com/?q=${street}%20${number},%20${postcodeStart}%20${cityStartName}

*Bestemming:*
${streetArrival} ${numberArrival}
${cityArrival}
https://maps.google.com/?q=${streetArrival}%20${numberArrival},%20${postcodeArrival}%20${cityArrivalName}

*Routebeschrijving:*
https://www.google.com/maps/dir/${encodeURIComponent(street + ' ' + number + ', ' + cityStart)}/${encodeURIComponent(streetArrival + ' ' + numberArrival + ', ' + cityArrivalName)}


${comments ? `*Extra opmerkingen:* ${comments}` : ''}`;

  document.getElementById("generatedText").textContent = generatedText;
});

document.getElementById("copyButton").addEventListener("click", function() {
  var generatedText = document.getElementById("generatedText");
  var textArea = document.createElement("textarea");
  textArea.value = generatedText.textContent;
  document.body.appendChild(textArea);
  textArea.select();
  document.execCommand("copy");
  document.body.removeChild(textArea);

  generatedText.classList.add("copied");

  setTimeout(function() {
      generatedText.classList.remove("copied");
  }, 500);
});

document.getElementById('addressSearch').addEventListener('input', debounce(fetchSuggestions, 300));
document.getElementById('addressSearchStart').addEventListener('input', debounce(fetchSuggestionsStart, 300));

async function fetchSuggestions() {
  const query = document.getElementById('addressSearch')?.value;
  const suggestionsList = document.getElementById('suggestionsList');

  if (query.length < 3) {
      suggestionsList.innerHTML = '';
      return;
  }

  const response = await fetch(`https://geo.api.vlaanderen.be/geolocation/v4/Suggestion?q=${query}&c=10`);
  const data = await response.json();

  suggestionsList.innerHTML = '';
  data.SuggestionResult.forEach(suggestion => {
      const li = document.createElement('li');
      li.textContent = suggestion;
      li.onclick = () => {
          fillInAddress(suggestion, 'streetArrival', 'numberArrival', 'cityArrival');
          suggestionsList.innerHTML = '';  // Clear the dropdown
      };
      suggestionsList.appendChild(li);
  });
}

async function fetchSuggestionsStart() {
  const query = document.getElementById('addressSearchStart')?.value;
  const suggestionsListStart = document.getElementById('suggestionsListStart');

  if (query.length < 3) {
      suggestionsListStart.innerHTML = '';
      return;
  }

  const response = await fetch(`https://geo.api.vlaanderen.be/geolocation/v4/Suggestion?q=${query}&c=25`);
  const data = await response.json();

  suggestionsListStart.innerHTML = '';
  data.SuggestionResult.forEach(suggestion => {
      const li = document.createElement('li');
      li.textContent = suggestion;
      li.onclick = () => {
          fillInAddress(suggestion, 'street', 'number', 'postcodeAndCity');
          suggestionsListStart.innerHTML = '';  // Clear the dropdown
      };
      suggestionsListStart.appendChild(li);
  });
}

function fillInAddress(address, streetId, numberId, cityId) {
  const addressParts = address.split(', ');
  const [streetAndNumber, city] = addressParts;
  const streetParts = streetAndNumber.split(' ');
  const number = streetParts.pop();
  const street = streetParts.join(' ');

  document.getElementById(streetId).value = street || '';
  document.getElementById(numberId).value = number || '';
  document.getElementById(cityId).value = city || '';
}

function debounce(func, delay) {
  let timeout;
  return function(...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), delay);
  };
}
