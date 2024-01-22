function toStr(elementId) {
    return document.getElementById(elementId).value.trim();
  }


  function fetchPostInfo() {
    // Retrieve postcode value
    var postcode = toStr("postcode");

    // Fetch data from the API
    fetch(`https://api.basisregisters.dev-vlaanderen.be/v1/postinfo/${postcode}`)
      .then(response => response.json())
      .then(data => {
        // Update the dropdown options based on the response
        var cityDropdown = document.getElementById("city");
        cityDropdown.innerHTML = ""; // Clear existing options

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

  function fetchPostInfo2() {
    // Retrieve postcode value
    var postcode = toStr("postcode2");

    // Fetch data from the API
    fetch(`https://api.basisregisters.dev-vlaanderen.be/v1/postinfo/${postcode}`)
      .then(response => response.json())
      .then(data => {
        // Update the dropdown options based on the response
        var cityDropdown = document.getElementById("city2");
        cityDropdown.innerHTML = ""; // Clear existing options

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

  

      document
        .getElementById("carForm")
        .addEventListener("submit", function (event) {
          event.preventDefault(); // Prevent the default form submission

          // Retrieve form values
          var carBrand = toStr("carBrand");
          var carModel = toStr("carModel");
          var carColor = toStr("carColor");
          var carPlate = toStr("carPlate");

          // Retrieve values for radio buttons
          var transmission = document.querySelector(
            'input[name="transmission"]:checked'
          ).value;
          var fuelType = document.querySelector(
            'input[name="fuelType"]:checked'
          ).value;

          var customerName = toStr("customerName");
          var phoneNumber = toStr("phoneNumber");

          var buildingTypeRadio = document.querySelector(
            'input[name="buildingType"]:checked'
          );
          var buildingType =
            buildingTypeRadio && buildingTypeRadio.value === "other"
              ? document.getElementById("otherBuildingText").value.trim()
              : buildingTypeRadio
              ? buildingTypeRadio.value.trim()
              : "";

          var street = toStr("street");
          var number = toStr("number");
          var postcode = toStr("postcode");
          var city = toStr("city");

          var street2 = toStr("street2");
          var number2 = toStr("number2");
          var postcode2 = toStr("postcode2");
          var city2 = toStr("city2");

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
${street2} ${number2}
${postcode2} ${city2}
https://maps.google.com/?q=${street2}%20${number2},%20${postcode2}%20${city2}

${comments ? `*Extra opmerkingen:* ${comments}` : ''}`;


          document.getElementById("generatedText").textContent = generatedText;
        });

      // Add copy-to-clipboard functionality
      document
  .getElementById("copyButton")
  .addEventListener("click", function () {
    var generatedText = document.getElementById("generatedText");
    var textArea = document.createElement("textarea");
    textArea.value = generatedText.textContent;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand("copy");
    document.body.removeChild(textArea);

    // Add the 'copied' class for the animation
    generatedText.classList.add("copied");

    // Remove the 'copied' class after the animation duration (500ms in this example)
    setTimeout(function () {
      generatedText.classList.remove("copied");
    }, 500);
  });