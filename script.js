const apiUrl = "https://api.statev.de/req";
const apiKey = "7YC9YM41X63SG52ZDL"; // Ersetze durch deinen API-Key
let vehicles = []; // Hier werden die Fahrzeugdaten gespeichert

// Funktion zum Abrufen der Fahrzeugdaten von der API
async function loadVehiclesFromAPI() {
  try {
    const response = await fetch(
      `${apiUrl}/factory/options/65c7771c35f1ed5c9e0198fc/1`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      }
    );

    if (response.ok) {
      const result = await response.json();
      vehicles = JSON.parse(result.data); // Konvertiere den JSON-String in ein JavaScript-Array
      displayVehicles(); // Fahrzeuge anzeigen
    } else {
      throw new Error("Fehler beim Abrufen der Fahrzeugdaten");
    }
  } catch (error) {
    console.error("Fehler: ", error);
    showToast("Fehler beim Laden der Fahrzeugdaten", false);
  }
}

// Funktion zum Erstellen der Fahrzeugliste auf der Website
function displayVehicles() {
  const vehicleListDiv = document.getElementById("vehicleList");
  vehicleListDiv.innerHTML = ""; // Bestehende Inhalte leeren

  vehicles.forEach((vehicle, index) => {
    const detailsTag = createVehicleDetailsTag(vehicle, index);
    vehicleListDiv.appendChild(detailsTag);
  });

  // Event Listener für Löschbuttons
  document.querySelectorAll(".delete-button").forEach((button) => {
    button.addEventListener("click", deleteVehicle);
  });
}

// Funktion zum Erstellen des Details-Tags für jedes Fahrzeug
function createVehicleDetailsTag(vehicle, index) {
  const detailsTag = document.createElement("details");
  const summaryTag = document.createElement("summary");
  summaryTag.textContent = vehicle.Fahrzeugname;

  const vehicleForm = `
    <br />
    <input type="hidden" id="id-${index}" value="${
    vehicle.id
  }" data-index="${index}" />
    ${createInputField("Fahrzeugname", "name", index, vehicle.Fahrzeugname)}
    ${decodeURIComponent(
      createInputField("PicURL", "picurl", index, vehicle.PicURL)
    )}
    ${createInputField("PS", "ps", index, vehicle.PS, "number")}
    ${createInputField(
      "Kilometerstand",
      "km",
      index,
      vehicle.Kilometerstand,
      "number"
    )}

    ${createInputField(
      "Kofferraumvolumen",
      "kofferraumvolumen",
      index,
      vehicle.Kofferraumvolumen,
      "number"
    )}
    ${createInputField("Preis", "preis", index, vehicle.Preis, "number")}
    <div class="select-wrapper">
    ${createSelectField(
      "Tuned",
      "tuned",
      index,
      [
        { value: true, text: "Ja" },
        { value: false, text: "Nein" },
      ],
      vehicle.Tuned
    )}
        
    ${createSelectField(
      "Zustand",
      "zustand",
      index,
      [
        { value: "Neuwagen", text: "Neuwagen" },
        { value: "Gebrauchtwagen", text: "Gebrauchtwagen" },
      ],
      vehicle.Zustand ? "Neuwagen" : "Gebrauchtwagen"
    )}
    </div>
    <button type="button" class="delete-button" data-index="${index}">Löschen</button>
  `;

  detailsTag.innerHTML = vehicleForm;
  detailsTag.prepend(summaryTag);
  return detailsTag;
}

// Funktion zur Erstellung eines Eingabefeldes
function createInputField(label, type, index, value, inputType = "text") {
  return `
    <label for="${type}-${index}">${label}:</label>
    <input type="${inputType}" id="${type}-${index}" value="${value}" data-index="${index}" />
  `;
}

// Funktion zur Erstellung eines Select-Feldes
function createSelectField(label, type, index, options, selectedValue) {
  const optionsHtml = options
    .map(
      (option) =>
        `<option value="${option.value}" ${
          option.value === selectedValue ? "selected" : ""
        }>${option.text}</option>`
    )
    .join("");

  return `
    <div class="select-container">
    <label for="${type}-${index}">${label}:</label>
    <select id="${type}-${index}" data-index="${index}">
      ${optionsHtml}
    </select>
    </div>
  `;
}

// Funktion zum Löschen eines Fahrzeugs
async function deleteVehicle(event) {
  const vehicleIndex = event.target.getAttribute("data-index");

  if (
    vehicleIndex !== null &&
    vehicleIndex >= 0 &&
    vehicleIndex < vehicles.length
  ) {
    const vehicleName = vehicles[vehicleIndex].Fahrzeugname; // Name des Fahrzeugs speichern
    vehicles.splice(vehicleIndex, 1); // Fahrzeug aus dem Array entfernen
    displayVehicles(); // Aktualisierte Liste anzeigen

    await updateVehiclesOnAPI(vehicleName + " erfolgreich gelöscht!");
  }
}

// Funktion zum Speichern der Änderungen
document
  .getElementById("saveChanges")
  .addEventListener("click", async function () {
    vehicles.forEach((vehicle, index) => {
      vehicle.Fahrzeugname = document.getElementById(`name-${index}`).value;
      vehicle.PicURL = encodeURIComponent(
        document.getElementById(`picurl-${index}`).value
      );
      vehicle.PS = parseInt(document.getElementById(`ps-${index}`).value, 10);
      vehicle.Kilometerstand = parseInt(
        document.getElementById(`km-${index}`).value,
        10
      );
      vehicle.Tuned =
        document.getElementById(`tuned-${index}`).value === "true";
      vehicle.Zustand =
        document.getElementById(`zustand-${index}`).value === "Neuwagen";
      vehicle.Kofferraumvolumen = parseFloat(
        document.getElementById(`kofferraumvolumen-${index}`).value
      );
      vehicle.Preis = parseFloat(
        document.getElementById(`preis-${index}`).value
      );
    });

    await updateVehiclesOnAPI("Änderungen erfolgreich gespeichert.");
    displayVehicles();
  });

// Funktion zum Hinzufügen eines neuen Fahrzeugs
document
  .getElementById("newVehicleForm")
  .addEventListener("submit", async function (event) {
    event.preventDefault();

    const newVehicle = {
      id: generateUniqueId(), // Einzigartige ID für jedes neue Fahrzeug
      Fahrzeugname: document.getElementById("newName").value,
      PicURL: encodeURIComponent(document.getElementById("newPicURL").value),
      PS: parseInt(document.getElementById("newPS").value, 10),
      Kilometerstand: parseInt(
        document.getElementById("newKilometerstand").value,
        10
      ),
      Tuned: document.getElementById("newTuned").value === "true",
      Zustand: document.getElementById("newZustand").value === "Neuwagen",
      Kofferraumvolumen: parseInt(
        document.getElementById("newKofferraumvolumen").value,
        10
      ),
      Preis: parseFloat(document.getElementById("newPreis").value),
    };

    vehicles.push(newVehicle); // Neues Fahrzeug zum Array hinzufügen
    displayVehicles(); // Liste aktualisieren

    await updateVehiclesOnAPI(
      `Fahrzeug "${newVehicle.Fahrzeugname}" wurde hinzugefügt.`
    );
    document.getElementById("newVehicleForm").reset();
  });

// Funktion zur Aktualisierung der Fahrzeugdaten in der API
async function updateVehiclesOnAPI(successMessage) {
  try {
    const response = await fetch(`${apiUrl}/factory/options`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        factoryId: "65c7771c35f1ed5c9e0198fc",
        option: 1,
        title: "Fahrzeuge",
        data: JSON.stringify(vehicles),
      }),
    });

    if (response.ok) {
      showToast(successMessage, true);
    } else {
      throw new Error("Fehler beim Speichern der Änderungen.");
    }
  } catch (error) {
    console.error("Fehler: ", error);
    showToast("Fehler: " + error.message, false);
  }
}

// Funktion zur Generierung einer einzigartigen ID
function generateUniqueId() {
  return Date.now();
}

// Funktion zum Anzeigen von Toast-Nachrichten
function showToast(message, success) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.className = success ? "toast show" : "toast error show";

  // Toast für 3 Sekunden anzeigen
  setTimeout(() => {
    toast.classList.remove("show");
  }, 3000);
}

// Beim Laden der Seite die Fahrzeugdaten laden
window.onload = loadVehiclesFromAPI;
