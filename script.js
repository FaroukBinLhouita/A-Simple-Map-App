'use strict';

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');
///////////////////
///////////////////

// prettier-ignore
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

// work class
class Work {
  date = new Date();
  id = (Date.now() + '').slice(-10);

  constructor(coords, distance, duration) {
    this.coords = coords;
    this.distance = distance;
    this.duration = duration;
  }

  _setDescription() {
    this.description = `${this.type[0].toUpperCase()}${this.type.slice(1)} on ${
      months[this.date.getMonth()]
    } ${this.date.getDate()}`;
  }
}

// running class
class Running extends Work {
  type = 'running';

  constructor(coords, distance, duration, cadence) {
    super(coords, distance, duration);
    this.cadence = cadence;
    this.calcCad();
    this._setDescription();
  }

  calcCad() {
    this.pace = this.duration / this.distance;
    return this.pace;
  }
}

// Cycle class
class Cycling extends Work {
  type = 'cycling';

  constructor(coords, distance, duration, elevation) {
    super(coords, distance, duration);
    this.elevation = elevation;
    this.calcEle();
    this._setDescription();
  }

  calcEle() {
    this.speed = this.duration / (this.distance / 60);
    return this.speed;
  }
}

// The APP
class App {
  #map;
  #mapE;
  #workOuts = [];

  constructor() {
    // Get the User location
    this._getPoistion();

    // changing Type
    inputType.addEventListener('change', this._toggleField.bind(this));

    // submiting form
    form.addEventListener('submit', this._newWorkOut.bind(this));

    // Search
    containerWorkouts.addEventListener('click', this._moveMark.bind(this));
  }

  // Get the User location
  _getPoistion() {
    if (navigator.geolocation)
      navigator.geolocation.getCurrentPosition(
        this._loadingMap.bind(this),
        function () {
          alert("Can't get Ur LOCATION");
        }
      );
  }

  // Loading the MAP
  _loadingMap(poistion) {
    const { latitude } = poistion.coords;
    const { longitude } = poistion.coords;
    const coords = [latitude, longitude];

    this.#map = L.map('map').setView(coords, 15);

    L.tileLayer('https://tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);

    // when the User click on Map
    this.#map.on('click', this._showForm.bind(this));
  }

  // show the form
  _showForm(e) {
    this.#mapE = e;
    form.classList.remove('hidden');
    inputDistance.focus();
  }

  // change the type
  _toggleField() {
    inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
    inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
  }

  // when User click enter
  _newWorkOut(e) {
    e.preventDefault();

    const valid = (...inputs) => inputs.every(input => Number.isFinite(input));
    const positive = (...inputs) => inputs.every(input => input > 0);

    // Get the User input

    const type = inputType.value;
    const distance = +inputDistance.value;
    const duration = +inputDuration.value;
    let workout;
    // get the location the User choose
    const { lat, lng } = this.#mapE.latlng;

    // if the type running
    if (type === 'running') {
      const cadence = +inputCadence.value;

      // check it
      if (
        !valid(distance, duration, cadence) ||
        !positive(distance, duration, cadence)
      )
        return alert('انت يا بنوسخه اكتب عدل');

      workout = new Running({ lat, lng }, distance, duration, cadence);
    }

    // if it cyc
    if (type === 'cycling') {
      const elevation = +inputElevation.value;

      // check it
      if (
        !valid(distance, duration, elevation) ||
        !positive(distance, duration, elevation)
      )
        return alert('Not correct input');

      workout = new Cycling({ lat, lng }, distance, duration, elevation);
    }

    this.#workOuts.push(workout);

    this._showMark(workout);

    this._showList(workout);

    this._hideForm();
  }

  _hideForm() {
    inputCadence.value =
      inputDistance.value =
      inputDuration.value =
      inputElevation.value =
        '';

    form.style.display = 'none';
    form.classList.add('hidden');
    setTimeout(() => (form.style.display = 'grid'), 1000);
  }

  _showMark(workOut) {
    L.marker(workOut.coords)
      .addTo(this.#map)
      .bindPopup(
        L.popup({
          maxWidth: 250,
          minWidth: 100,
          autoClose: false,
          closeOnClick: false,
          className: `${workOut.type}-popup`,
        })
      )
      .setPopupContent(
        `${workOut.type === 'running' ? '🏃‍♂️' : '🚴‍♀️'}${workOut.description}`
      )
      .openPopup();
  }

  _showList(workOut) {
    let html = `
    <li class="workout workout--${workOut.type}" data-id="${workOut.id}">
    <h2 class="workout__title">${workOut.description}</h2>
    <div class="workout__details">
      <span class="workout__icon">${
        workOut.type === 'running' ? '🏃‍♂️' : '🚴‍♀️'
      }</span>
      <span class="workout__value">${workOut.distance}</span>
      <span class="workout__unit">km</span>
    </div>
    <div class="workout__details">
      <span class="workout__icon">⏱</span>
      <span class="workout__value">${workOut.duration}</span>
      <span class="workout__unit">min</span>
    </div>
    `;

    if (workOut.type === 'running')
      html += `
      <div class="workout__details">
            <span class="workout__icon">⚡️</span>
            <span class="workout__value">${workOut.pace.toFixed(1)}</span>
            <span class="workout__unit">min/km</span>
      </div>
      <div class="workout__details">
            <span class="workout__icon">🦶🏼</span>
            <span class="workout__value">${workOut.cadence}</span>
            <span class="workout__unit">spm</span>
      </div>
        </li>      
      `;

    if (workOut.type === 'cycling')
      html += `
      <div class="workout__details">
            <span class="workout__icon">⚡️</span>
            <span class="workout__value">${workOut.speed.toFixed(1)}</span>
            <span class="workout__unit">km/h</span>
      </div>
      <div class="workout__details">
            <span class="workout__icon">⛰</span>
            <span class="workout__value">${workOut.elevation}</span>
            <span class="workout__unit">m</span>
      </div>
        </li>      
      `;

    form.insertAdjacentHTML('afterend', html);
  }

  _moveMark(e) {
    const workoutParent = e.target.closest('.workout');
    if (!workoutParent) return;

    const workOut = this.#workOuts.find(
      work => work.id === workoutParent.dataset.id
    );

    this.#map.setView(workOut.coords, 17, {
      animate: true,
      pan: {
        duration: 1,
      },
    });
  }
}

const app = new App();
/*///////////////////
///////////////////

///////////////////
///////////////////
///////////////////v

///////////////////
///////////////////
///////////////////
///////////////////

///////////////////

///////////////////v

///////////////////
///////////////////
///////////////////
///////////////////
///////////////////
///////////////////
///////////////////
///////////////////
///////////////////
///////////////////
///////////////////
///////////////////
///////////////////
///////////////////
///////////////////
/*
///////////////////////////////////
/// Applaction
class App {
  #map;
  #mapE;
  #works = [];

  constructor() {
    this._getPoistion();
    form.addEventListener('submit', this._newOutWork.bind(this));
    inputType.addEventListener('change', this._toggleField.bind(this));
    containerWorkouts.addEventListener('click', this._moveMark.bind(this));
  }

 

  _newOutWork(e) {
    const valid = (...inputs) => inputs.every(input => Number.isFinite(input));
    const positive = (...inputs) => inputs.every(input => input > 0);

    e.preventDefault();

    const type = inputType.value;
    const distance = +inputDistance.value;
    const duration = +inputDuration.value;
    const { lat, lng } = this.#mapE.latlng;

    let workOut;

    if (type === 'running') {
      const cadence = +inputCadence.value;

      if (
        !valid(duration, distance, cadence) ||
        !positive(duration, distance, cadence)
      )
        return;

      workOut = new Running({ lat, lng }, distance, duration, cadence);
    }

    if (type === 'cycling') {
      const elevation = +inputElevation.value;

      if (
        !valid(duration, distance, elevation) ||
        !positive(duration, distance)
      )
        return alert('unvalid input');

      workOut = new Cycling({ lat, lng }, distance, duration, elevation);
    }

    this.#works.push(workOut);

    
}

const app = new App();


class Workout {
  date = new Date();
  id = (Date.now() + '').slice(-10);

  constructor(coords, distance, duration) {
    this.coords = coords;
    this.distance = distance;
    this.duration = duration;
  }




*/
