const contentElement = document.getElementById('content');
const charactersLink = document.getElementById('characters-link');
const planetsLink = document.getElementById('planets-link');
const vehiclesLink = document.getElementById('vehicles-link');
const paginationElement = document.getElementById('pagination');
const prevPageButton = document.getElementById('prev-page');
const nextPageButton = document.getElementById('next-page');

const itemsPerPage = 5;
let currentPage = 1;

function fetchData(url) {
    return fetch(url)
        .then(response => response.json())
        .catch(error => console.error('Error fetching data:', error));
}

function formatDate(dateString) {
    if (dateString === 'unknown') {
        return 'Невідома';
    }

    if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
        const [year, month, day] = dateString.split('-');
        return `${day}/${month}/${year}`;
    }

    return dateString;
}

const ukrainianTranslations = {
    name: 'Ім\'я',
    height: 'Висота',
    mass: 'Маса',
    birth_year: 'Рік народження',
    gender: 'Стать',
    hair_color: 'Колір волосся',
    skin_color: 'Колір шкіри',
    eye_color: 'Колір ока',
    climate: 'Клімат',
    terrain: 'Територія',
    population: 'Населення',
    model: 'Модель',
    manufacturer: 'Виробник',
    passengers: 'Пасажири',
    vehicle_class: 'Клас транспорту',
};

function createDetailsElement(title, details) {
    const detailsElement = document.createElement('div');
    detailsElement.classList.add('details');
    detailsElement.innerHTML = `
        <h2>${title}</h2>
        ${details}
    `;
    return detailsElement;
}

function displayData(data, displayFunction, page = 1) {
    contentElement.innerHTML = '';

    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;

    data.slice(startIndex, endIndex).forEach(item => {
        const itemElement = document.createElement('div');
        itemElement.classList.add('item');
        itemElement.textContent = item.name;
        contentElement.appendChild(itemElement);

        const detailsElement = displayFunction(item);
        contentElement.appendChild(detailsElement);

        const moreButton = document.createElement('button');
        moreButton.textContent = 'Більше';
        moreButton.addEventListener('click', () => {
            fetch(item.url)
                .then(response => response.json())
                .then(details => {
                    const fullDetails = Object.entries(details)
                        .filter(([key, value]) => value && key !== 'url' && key !== 'created' && key !== 'edited' && !Array.isArray(value))
                        .map(([key, value]) => {
                            if (ukrainianTranslations[key]) {
                                key = ukrainianTranslations[key];
                            }
                            if (key === 'birth_year') {
                                value = formatDate(value);
                            }
                            if (value.includes('_')) {
                                value = value.replace('_', ' ');
                            }
                            return `${key}: ${value}`;
                        })
                        .join('<br>');
                    
                    const fullDetailsElement = createDetailsElement('Повні деталі', fullDetails);
                    contentElement.replaceChild(fullDetailsElement, detailsElement);
                });
        });
        contentElement.appendChild(moreButton);
    });

    renderPagination(data.count, page);
}

function renderPagination(totalItems, currentPage) {
    paginationElement.innerHTML = '';

    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const maxVisiblePages = Math.min(totalPages, 20); // Обмежуємо до 20

    for (let i = 1; i <= maxVisiblePages; i++) {
        const pageButton = document.createElement('button');
        pageButton.textContent = i;
        pageButton.addEventListener('click', () => {
            handlePageClick(i);
        });
        if (i === currentPage) {
            pageButton.classList.add('active');
        }
        paginationElement.appendChild(pageButton);
    }
    prevPageButton.disabled = currentPage === 1;
    nextPageButton.disabled = currentPage === totalPages;
}

function handlePageClick(page) {
    currentPage = page;
    fetchDataForSelectedEntity(currentPage);
}

function fetchDataForSelectedEntity(page) {
    const activeLink = document.querySelector('.nav-link.active');

    if (activeLink === charactersLink) {
        const activeType = 'people';
        const pageNumber = Math.min(page, 20);  // Обмежуємо до 20
        fetchData(`https://swapi.dev/api/${activeType}/?page=${pageNumber}`)
            .then(data => {
                displayData(data.results, item => createDetailsElement('Персонаж', `
                    ${ukrainianTranslations['name']}: ${item.name}
                    ${ukrainianTranslations['height']}: ${item.height}
                    ${ukrainianTranslations['mass']}: ${item.mass}
                    ${ukrainianTranslations['birth_year']}: ${formatDate(item.birth_year)}
                    ${ukrainianTranslations['gender']}: ${item.gender}
                `), page);
                renderPagination(data.count, pageNumber);
            });
    } else if (activeLink === planetsLink) {
        const activeType = 'planets';
        const pageNumber = Math.min(page, 20);  // Обмежуємо до 20
        fetchData(`https://swapi.dev/api/${activeType}/?page=${pageNumber}`)
            .then(data => {
                displayData(data.results, item => createDetailsElement('Планета', `
                    ${ukrainianTranslations['name']}: ${item.name}
                    ${ukrainianTranslations['climate']}: ${item.climate}
                    ${ukrainianTranslations['terrain']}: ${item.terrain}
                    ${ukrainianTranslations['population']}: ${item.population}
                `), page);
                renderPagination(data.count, pageNumber);
            });
    } else if (activeLink === vehiclesLink) {
        const activeType = 'vehicles';
        const pageNumber = Math.min(page, 20);  // Обмежуємо до 20
        fetchData(`https://swapi.dev/api/${activeType}/?page=${pageNumber}`)
            .then(data => {
                displayData(data.results, item => createDetailsElement('Транспорт', `
                    ${ukrainianTranslations['name']}: ${item.name}
                    ${ukrainianTranslations['model']}: ${item.model}
                    ${ukrainianTranslations['manufacturer']}: ${item.manufacturer}
                    ${ukrainianTranslations['passengers']}: ${item.passengers}
                    ${ukrainianTranslations['vehicle_class']}: ${item.vehicle_class}
                `), page);
                renderPagination(data.count, pageNumber);
            });
    }
}

charactersLink.addEventListener('click', () => {
    charactersLink.classList.add('nav-link', 'active');
    planetsLink.classList.remove('active');
    vehiclesLink.classList.remove('active');
    currentPage = 1;
    fetchDataForSelectedEntity(currentPage);
});

planetsLink.addEventListener('click', () => {
    charactersLink.classList.remove('active');
    planetsLink.classList.add('nav-link', 'active');
    vehiclesLink.classList.remove('active');
    currentPage = 1;
    fetchDataForSelectedEntity(currentPage);
});

vehiclesLink.addEventListener('click', () => {
    charactersLink.classList.remove('active');
    planetsLink.classList.remove('active');
    vehiclesLink.classList.add('nav-link', 'active');
    currentPage = 1;
    fetchDataForSelectedEntity(currentPage);
});

prevPageButton.addEventListener('click', () => {
    if (currentPage > 1) {
        handlePageClick(currentPage - 1);
    }
});

nextPageButton.addEventListener('click', () => {
    handlePageClick(currentPage + 1);
});

fetchDataForSelectedEntity(currentPage);
