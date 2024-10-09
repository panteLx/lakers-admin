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
      console.error("Fehler beim Abrufen der Fahrzeugdaten");
    }
  } catch (error) {
    console.error("Fehler: ", error);
  }
}

// Funktion zum Erstellen der Fahrzeugliste auf der Website
function displayVehicles() {
  const vehicleListDiv = document.getElementById("vehicleList");
  vehicleListDiv.innerHTML = ""; // Bestehende Inhalte leeren

  vehicles.forEach((vehicle, index) => {
    // Erstellen des Details-Tags für jedes Fahrzeug
    const detailsTag = document.createElement("details");
    const summaryTag = document.createElement("summary");
    summaryTag.textContent = vehicle.Fahrzeugname;

    const vehicleForm = `
        <br />
            <input type="hidden" type="text" id="id-${index}" value="${
      vehicle.id
    }" data-index="${index}" />

            <label for="name-${index}">Fahrzeugname:</label>
            <input type="text" id="name-${index}" value="${
      vehicle.Fahrzeugname
    }" data-index="${index}" />

            <label for="ps-${index}">PS:</label>
            <input type="number" id="ps-${index}" value="${
      vehicle.PS
    }" data-index="${index}" />

            <label for="km-${index}">Kilometerstand:</label>
            <input type="number" id="km-${index}" value="${
      vehicle.Kilometerstand
    }" data-index="${index}" />

            <label for="tuned-${index}">Tuned:</label>
            <select id="tuned-${index}" data-index="${index}">
                <option value="true" ${
                  vehicle.Tuned ? "selected" : ""
                }>Ja</option>
                <option value="false" ${
                  !vehicle.Tuned ? "selected" : ""
                }>Nein</option>
            </select>

            <label for="zustand-${index}">Zustand:</label>
            <select id="zustand-${index}" data-index="${index}">
                <option value="Neuwagen" ${
                  vehicle.Zustand ? "selected" : ""
                }>Neuwagen</option>
                <option value="Gebrauchtwagen" ${
                  !vehicle.Zustand ? "selected" : ""
                }>Gebrauchtwagen</option>
            </select>

            <label for="preis-${index}">Preis:</label>
            <input type="number" id="preis-${index}" value="${
      vehicle.Preis
    }" data-index="${index}" />

            <button type="button" class="delete-button" data-index="${index}">Löschen</button>
        `;

    detailsTag.innerHTML = vehicleForm;
    detailsTag.prepend(summaryTag);
    vehicleListDiv.appendChild(detailsTag);
  });

  // Event Listener für Löschbuttons
  const deleteButtons = document.querySelectorAll(".delete-button");
  deleteButtons.forEach((button) => {
    button.addEventListener("click", deleteVehicle);
  });
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

    // API-Request zum Löschen des Fahrzeugs
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
        showToast(`${vehicleName} erfolgreich gelöscht`, false);
      } else {
        showToast("Fehler beim Löschen des Fahrzeugs", false);
      }
    } catch (error) {
      console.error("Fehler: ", error);
      showToast("Fehler: " + error.message, false);
    }
  }
}

// Funktion zum Speichern der Änderungen
document
  .getElementById("saveChanges")
  .addEventListener("click", async function () {
    // Durchlaufe alle Fahrzeuge und aktualisiere die Werte aus den Eingabefeldern
    vehicles.forEach((vehicle, index) => {
      vehicle.Fahrzeugname = document.getElementById(`name-${index}`).value;
      vehicle.PS = document.getElementById(`ps-${index}`).value;
      vehicle.Kilometerstand = document.getElementById(`km-${index}`).value;
      vehicle.Tuned =
        document.getElementById(`tuned-${index}`).value === "true";
      vehicle.Zustand =
        document.getElementById(`zustand-${index}`).value === "Neuwagen";
      vehicle.Preis = document.getElementById(`preis-${index}`).value;
    });

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
          data: JSON.stringify(vehicles), // Die aktualisierten Fahrzeugdaten als JSON-String senden
        }),
      });

      if (response.ok) {
        showToast("Änderungen erfolgreich gespeichert.", true); // Erfolgreiche Toast-Nachricht
        displayVehicles();
      } else {
        showToast("Fehler beim Speichern der Änderungen.", false); // Fehler-Toast-Nachricht
      }
    } catch (error) {
      console.error("Fehler: ", error);
      showToast("Fehler beim Speichern der Änderungen.", false); // Fehler-Toast-Nachricht
    }
  });

// Funktion zum Hinzufügen eines neuen Fahrzeugs
document
  .getElementById("newVehicleForm")
  .addEventListener("submit", async function (event) {
    event.preventDefault();

    const newVehicle = {
      id: generateUniqueId(), // Einzigartige ID für jedes neue Fahrzeug
      Fahrzeugname: document.getElementById("newName").value,
      PS: parseInt(document.getElementById("newPS").value, 10),
      Kilometerstand: parseInt(
        document.getElementById("newKilometerstand").value,
        10
      ),
      Tuned: document.getElementById("newTuned").value === "true",
      Zustand: document.getElementById("newZustand").value === "Neuwagen",
      Preis: document.getElementById("newPreis").value,
    };

    vehicles.push(newVehicle); // Neues Fahrzeug zum Array hinzufügen
    displayVehicles(); // Liste aktualisieren

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
        showToast(
          `Fahrzeug "${newVehicle.Fahrzeugname}" wurde hinzugefügt.`,
          true
        );
      } else {
        showToast("Fehler beim Hinzufügen des Fahrzeugs", false);
      }
    } catch (error) {
      console.error("Fehler: ", error);
      showToast("Fehler: " + error.message, false);
    }
  });
document.getElementById("newVehicleForm").reset();

// Funktion zur Generierung einer einzigartigen ID
function generateUniqueId() {
  return "vehicle-" + Date.now();
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
