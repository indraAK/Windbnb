const stayListEL = document.getElementById("stayList");
const searchForm = document.getElementById("searchForm");
const locationInput = document.getElementById("location");
const suggestionsList = document.querySelector(".suggestions");
const loader = document.querySelector(".loader");

searchForm.addEventListener("submit", handleSubmitForm);
locationInput.addEventListener(
  "keyup",
  debounce(() => filterStaysByCity(locationInput.value), 500)
);
window.addEventListener("click", handleOutsideClick);

(async () => {
  const stays = await fetchStays();
  renderStays(stays);
})();

async function fetchStays() {
  try {
    const res = await fetch("/stays.json");
    const data = await res.json();
    return data;
  } catch (err) {
    console.log(err.message);
  }
}

const filterStaysByCity = async (city) => {
  const stays = await fetchStays();
  if (city) {
    const suggestionCities = stays
      .filter((stay) => stay.city.toLowerCase().includes(city.toLowerCase()))
      .map((stay) => stay.city)
      .filter((cityVal, idx, arr) => arr.indexOf(cityVal) === idx);
    return renderSuggestions(suggestionCities);
  }

  if (city === "") {
    return renderSuggestions([]);
  }
};

const filterStaysByCityAndMaxGuests = async (city, maxGuests) => {
  const stays = await fetchStays();
  const filteredStays = stays.filter((stay) => {
    return (
      stay.city.toLowerCase().includes(city.toLowerCase()) &&
      stay.maxGuests <= maxGuests
    );
  });

  renderStays(filteredStays);
};

const renderStays = (stays) => {
  stayListEL.innerHTML = "";
  loader.style.display = "block";

  setTimeout(() => {
    stays.forEach((stay) => {
      stayListEL.innerHTML += createStayCard(stay);
    });

    loader.style.display = "none";
  }, 2000);
};

const createStayCard = (stay) => {
  return `
   <div class="stay-card">
      <div class="stay-header">
         <img
         src="${stay.photo}"
         alt=""
         class="stay-photo"
         />
      </div>
      <div class="stay-content">
         <div class="stay-info">
         ${stay.superHost ? '<p class="stay-badge">Super host</p>' : ""}
         <p class="stay-type">${stay.type}</p>
         <div class="stay-rating">
            <span class="material-icons icon"> star </span>
            <span class="rating">${stay.rating}</span>
         </div>
         </div>
         <h3 class="stay-title">${stay.title}</h3>
      </div>
   </div>
   `;
};

const renderSuggestions = (suggestions) => {
  suggestionsList.innerHTML = "";
  if (suggestions.length > 0) {
    suggestions.forEach((city) => {
      const listItem = document.createElement("li");
      const cityAnchor = document.createElement("a");
      cityAnchor.href = "#";
      cityAnchor.textContent = city;
      cityAnchor.addEventListener("click", handleSuggestionClick);
      listItem.appendChild(cityAnchor);
      suggestionsList.appendChild(listItem);
    });
    suggestionsList.style.display = "block";
  } else {
    suggestionsList.style.display = "none";
  }
};

function handleOutsideClick(event) {
  const targetElement = event.target;
  if (
    targetElement.classList.contains("suggestions") ||
    targetElement.offsetParent === suggestionsList
  ) {
    suggestionsList.style.display = "block";
  } else {
    suggestionsList.style.display = "none";
  }
}

function handleSuggestionClick(event) {
  event.preventDefault();
  const value = event.target.textContent;
  locationInput.value = value;
  suggestionsList.style.display = "none";
}

function handleSubmitForm(event) {
  event.preventDefault();
  const locationValue = searchForm["location"].value;
  const guestsValue = searchForm["guests"].value;
  filterStaysByCityAndMaxGuests(locationValue, guestsValue);
}

function debounce(func, delay) {
  let timer;
  return () => {
    clearTimeout(timer);
    timer = setTimeout(func, delay);
  };
}
