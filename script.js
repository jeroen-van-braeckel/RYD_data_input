function toStr(id) {
    return document.getElementById(id)?.value.trim() || "";
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
  
  let number = '';
  let street = streetAndNumber;

  if (!isNaN(streetParts[streetParts.length - 1])) {
    number = streetParts.pop();
    street = streetParts.join(' ');
  }

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

const otherRadio = document.getElementById('otherBuildingRadio');
const otherInput = document.getElementById('otherBuildingText');

// Initially hide the "other" input field
otherInput.style.display = 'none';

// Add event listener to the radio buttons
document.querySelectorAll('input[name="buildingType"]').forEach(radio => {
  radio.addEventListener('change', function() {
    if (otherRadio.checked) {
      otherInput.style.display = 'block'; // Show the input if "other" is selected
    } else {
      otherInput.style.display = 'none'; // Hide the input if any other option is selected
    }
  });
});


document.getElementById('phoneNumber').addEventListener('focusout', function(event){
    const phoneNumber = document.getElementById('phoneNumber').value;
    const phoneNumberPattern = /^[0-9]{10}$/;
    const warningMessage = document.getElementById('phoneWarning');
  
    // Check if the phone number doesn't match the pattern
    if (!phoneNumberPattern.test(phoneNumber)) {
      // Prevent the warning message from being added multiple times
      if (!warningMessage) {
        const warning = document.createElement('p');
        warning.id = 'phoneWarning';
        warning.textContent = '⚠️ Het gsm nummer moet 10 cijfers bevatten.';
        warning.style.color = 'red';
        document.getElementById('phoneNumber').parentElement.appendChild(warning);
      }
    } else if (warningMessage) {
      warningMessage.remove(); // Remove the warning if the phone number is valid
    }
  });

  const passengersInput = document.getElementById('numberOfPassengers');
  const seatsInput = document.getElementById('numberOfSeats');
  const comparisonText = document.getElementById('comparison');

  function updateComparison() {
    const passengers = parseInt(passengersInput.value) || 0;
    const seats = parseInt(seatsInput.value) || 0;
    const totalWithVolunteer = passengers + 1;

    if (totalWithVolunteer > seats) {
      comparisonText.textContent = `⚠️ Onvoldoende zitplaatsen: ${totalWithVolunteer} < ${seats}`;
      comparisonText.style.color = 'red';
    } else {
      comparisonText.textContent = `✔️ Voldoende zitplaatsen: ${totalWithVolunteer} <= ${seats}`;
      comparisonText.style.color = 'green';
    }
  }

  passengersInput.addEventListener('input', updateComparison);
  seatsInput.addEventListener('input', updateComparison);

  document.getElementById("generatePdfButton").addEventListener("click", function () {
    const { jsPDF } = window.jspdf;
  
    // Fetch input values
    const carBrand = toStr("carBrand");
    const carModel = toStr("carModel");
    const carColor = toStr("carColor");
    const carPlate = toStr("carPlate");
    const transmission = document.querySelector('input[name="transmission"]:checked')?.value;
    const fuelType = document.querySelector('input[name="fuelType"]:checked')?.value;
  
    const customerName = toStr("customerName");
    const phoneNumber = toStr("phoneNumber");
  
    const buildingTypeRadio = document.querySelector('input[name="buildingType"]:checked');
    const buildingType = buildingTypeRadio && buildingTypeRadio?.value === "other" ? document.getElementById("otherBuildingText")?.value.trim() : buildingTypeRadio ? buildingTypeRadio?.value.trim() : "";
  
    const street = toStr("street");
    const number = toStr("number");
    const cityStart = toStr("postcodeAndCity");
  
    const [postcodeStart, ...cityPartsStart] = cityStart.split(' ');
    const cityStartName = cityPartsStart.join(' ');
  
    const streetArrival = toStr("streetArrival");
    const numberArrival = toStr("numberArrival");
    const cityArrival = toStr("cityArrival");
  
    const [postcodeArrival, ...cityPartsArrival] = cityArrival.split(' ');
    const cityArrivalName = cityPartsArrival.join(' ');
  
    const comments = toStr("comments");
  
    // Generate PDF
    const pdf = new jsPDF();
    pdf.setFontSize(14);
    pdf.setTextColor(40);
  
    // Add image
    const imgData = 'https://raw.githubusercontent.com/jeroen-van-braeckel/RYD_data_input/master/ryd_logo_no_text.png'  // Path to the uploaded image
    pdf.addImage(imgData, 'PNG', 15, 10, 30, 30);
  
    // Title
    pdf.setFont("helvetica", "bold");
    pdf.text("Opdracht nr. ___", 105, 20, { align: "center" });
  
    // Section: Customer Details
    pdf.setFont("helvetica", "normal");
    pdf.text("Feestvierder:", 12, 50);
    pdf.setFont("helvetica", "bold");
    pdf.text(customerName, 60, 50);
    pdf.text(phoneNumber, 60, 60);
  
    // Section: Car Details
    pdf.setFont("helvetica", "normal");
    pdf.text("Gegevens wagen:", 12, 80);
    pdf.setFont("helvetica", "bold");
    pdf.text(`${carBrand} ${carModel}`, 60, 80);
    pdf.text(`Nummerplaat: ${carPlate}`, 60, 90);
    pdf.text(`Kleur: ${carColor}`, 60, 100);
    pdf.text(`Schakeling: ${transmission}`, 60, 110);
    pdf.text(`Brandstof: ${fuelType}`, 60, 120);
  
   // Horizontal Layout: Start and Destination
  pdf.setFont("helvetica", "normal");
  pdf.text("Startpunt:", 12, 140);
  pdf.setTextColor(37, 150, 190);
  pdf.setFont("helvetica", "bold");
  pdf.text(`${street} ${number}`, 12, 150);
  pdf.text(cityStart.toUpperCase(), 12, 160);
  pdf.text(`Type gebouw: ${buildingType}`, 12, 170);


  // Draw an arrow between Start and Destination
  const arrowStartX = 80; // X position where the arrow starts
  const arrowY = 150; // Y position of the arrow line
  const arrowEndX = 100; // X position where the arrow ends

  // Line for the arrow
  pdf.setDrawColor(0, 0, 0); // Black color for the arrow
  pdf.setLineWidth(0.5);
  pdf.line(arrowStartX, arrowY, arrowEndX, arrowY); // Horizontal line

  // Arrowhead (triangle)
  pdf.line(arrowEndX, arrowY, arrowEndX - 2, arrowY - 2); // Top diagonal line
  pdf.line(arrowEndX, arrowY, arrowEndX - 2, arrowY + 2); // Bottom diagonal line


  pdf.setTextColor(0, 0, 0);
  pdf.setFont("helvetica", "normal");
  pdf.text("Bestemming:", 110, 140);
  pdf.setTextColor(37, 150, 190);
  pdf.setFont("helvetica", "bold");
  pdf.text(`${streetArrival} ${numberArrival}`, 110, 150);
  pdf.text(cityArrival.toUpperCase(), 110, 160);
  
    // Section: Comments (if any)
    pdf.setFont("helvetica", "normal");
  pdf.setTextColor(0, 0, 0);
    if (comments) {
      pdf.text("Opmerkingen:", 12, 210);
      pdf.setFont("helvetica", "bold");
      pdf.text(comments, 50, 210);
    }
  
    const pdfBlob = pdf.output("blob");
    const pdfUrl = URL.createObjectURL(pdfBlob);
    const printWindow = window.open(pdfUrl);
  
    // Trigger the print dialog
    printWindow.onload = () => {
      printWindow.print();
    };
  });