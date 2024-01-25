document.addEventListener('DOMContentLoaded', function () {
    const addButton = document.querySelector('.btn-primary');
    const requiredInputs = document.querySelectorAll('[required]');

    requiredInputs.forEach(input => {
        input.addEventListener('input', updateButtonStatus);
    });

    if (addButton) {
        addButton.addEventListener('click', handleAddButtonClick);
    }

    fetchCarsAndPopulateList();

    function handleAddButtonClick(event) {
        event.preventDefault(); 
        if (areAllInputsFilled()) {
            const confirmationModal = new bootstrap.Modal(document.getElementById('confirmationModal'));
            confirmationModal.show();
        }
    }

    
    function areAllInputsFilled() {
        return Array.from(requiredInputs).every(input => input.value.trim() !== '');
    }

    function updateButtonStatus() {
        addButton.disabled = !areAllInputsFilled();
    }

    updateButtonStatus();
});

function refreshCarList() {
    fetchCarsAndPopulateList();
}


// Adding a car into the database
function addCar() {
    const make = document.getElementById("car-brand").value;
    const model = document.getElementById("car-model").value;
    const licenseplate = document.getElementById("licenseplate").value;
    const color = document.getElementById("car-color").value;
    const year = document.getElementById("car-model-year").value;
    const mileage = document.getElementById("miles-traveled").value;

   
    fetch('http://localhost:3003/api/cars', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ make, model, licenseplate, color, year, mileage }),
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        console.log('Car added successfully', data);
        // Hantera framgångsrikt tillagd bil
    })
    .catch(error => {
        console.error('Error adding car', error);
        alert('Ett fel uppstod: ' + error.message); // Visa användarvänligt felmeddelande
    });
}





function updateCar() {
    const licenseplate = document.getElementById("car-change-reg").value; // Använd licenseplate som identifierare
    const newData = {
        make: document.getElementById("change-car-brand").value,
        model: document.getElementById("change-car-model").value,
        color: document.getElementById("change-car-color").value,
        year: parseInt(document.getElementById("change-car-year").value, 10),
        mileage: parseInt(document.getElementById("change-car-miles").value, 10)
    };

    fetch(`http://localhost:3003/api/cars/${encodeURIComponent(licenseplate)}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(newData)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        console.log('Car updated successfully', data);
        // Uppdatera gränssnittet efter uppdateringen
    })
    .catch(error => {
        console.error('Error updating car', error);
    });
}


function removeCar() {
    const licenseplate = document.getElementById("licenseplateToRemove").value; // Ändra från "carIdToRemove" till "licenseplateToRemove"

    if (!licenseplate) {
        alert("Vänligen ange ett registreringsnummer för att ta bort.");
        return;
    }

    fetch(`http://localhost:3003/api/cars/${licenseplate}`, {
        method: 'DELETE',
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        console.log('Bil borttagen framgångsrikt', data);
        // Uppdatera gränssnittet efter borttagning
    })
    .catch(error => {
        console.error('Error removing car', error);
    });
}


// Fetch cars and populate the list
function fetchCarsAndPopulateList() {
    fetch('http://localhost:3003/api/cars')
        .then(response => response.json())
        .then(data => {
            const carList = document.getElementById('car-list');
            carList.innerHTML = ''; // Clear the list before adding new elements
            data.forEach(car => {
                const carItem = document.createElement('li');
                carItem.textContent = `${car.make} ${car.model} (${car.year}) - ${car.licenseplate}`;
                carList.appendChild(carItem);
            });
        })
        .catch(error => {
            // Om det uppstår ett fel under anropet, logga felet och visa ett felmeddelande.
            console.error('Error', error);
            alert('Kunde inte ladda bilarna: ' + error.message);
        });
}


// Modal event listeners for car update
document.getElementById('adjustCarModalFirst').addEventListener('shown.bs.modal', function () {
    document.getElementById('car-change-reg').focus();
});

document.getElementById('adjustCarModalSecond').addEventListener('shown.bs.modal', function () {
    const licenseplate = document.getElementById('car-change-reg').value;
    fetch(`http://localhost:3003/api/cars/${licenseplate}`)
        .then(response => response.json())
        .then(data => {
            document.getElementById('change-car-model').value = data.model || '';
            // Set the rest of the fields
        })
        .catch(error => console.error('Error:', error));
});

document.getElementById('adjustCarModalThird').addEventListener('shown.bs.modal', function () {
    const licenseplate = document.getElementById('car-change-reg').value;
    updateCar(licenseplate); // Call updateCar with the new licenseplate
});


