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
  var postcode = toStr("postcode");
  var city = toStr("city");

  var streetArrival = toStr("streetArrival");
  var numberArrival = toStr("numberArrival");
  var postcodeArrival = toStr("postcodeArrival");
  var cityArrival = toStr("cityArrival");

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
${postcode} ${city}
https://maps.google.com/?q=${street}%20${number},%20${postcode}%20${city}

*Bestemming:*
${streetArrival} ${numberArrival}
${cityArrival}
https://maps.google.com/?q=${streetArrival}%20${numberArrival},%20${cityArrival}

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
          fillInAddress(suggestion);
          suggestionsList.innerHTML = '';  // Clear the dropdown
      };
      suggestionsList.appendChild(li);
  });
}

function fillInAddress(address) {
  const addressParts = address.split(', ');
  const [streetAndNumber, city] = addressParts;
  const streetParts = streetAndNumber.split(' ');
  const number = streetParts.pop();
  const street = streetParts.join(' ');

  document.getElementById('streetArrival').value = street || '';
  document.getElementById('numberArrival').value = number || '';
  document.getElementById('cityArrival').value = city || '';
}

function debounce(func, delay) {
  let timeout;
  return function(...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), delay);
  };
}
