document.addEventListener("DOMContentLoaded", loadItems);

let itemsData = [];

// Cargar los ítems desde el JSON
function loadItems() {
    fetch('bbdditems.json')
        .then(response => response.json())
        .then(data => {
            itemsData = data.items;

            // Aplicar filtros y mostrar el catálogo después de un pequeño retraso
            setTimeout(() => {
                applyFiltersFromURL();  // Aplicar los filtros de la URL si existen
                const catalog = document.getElementById('catalog');
                catalog.classList.remove('hidden'); // Mostrar el catálogo con animación
                catalog.classList.add('visible'); // Agregar clase visible
            }, 100); // Ajusta este tiempo si es necesario
        });
}

// Mostrar los ítems en el catálogo
function displayItems(items) {
    const catalog = document.getElementById('catalog');
    catalog.innerHTML = '';

    // Crear un contenedor para los nuevos elementos
    const newItemsContainer = document.createElement('div');

    items.forEach(item => {
        const itemCard = `
            <div class="item-card">
                <img src="${item.image}" alt="${item.name}">
                <div class="item-content">
                    <h3>${item.name}</h3>
                    <p>${item.description}</p>
                    <div class="color-categories">
                        <div class="colors">
                            <strong>Colores:</strong> ${item.colors.join(", ")}
                        </div>
                        <div class="categories">
                            <strong>Categorías:</strong> ${item.categories.join(", ")}
                        </div>
                        <div class="mod">
                            <strong>Mod:</strong> ${item.mod}
                        </div>
                    </div>
                </div>
            </div>
        `;
        newItemsContainer.innerHTML += itemCard;
    });

    // Añadir el contenedor con clase 'hidden'
    newItemsContainer.classList.add('hidden');

    // Agregar el contenedor al catálogo
    catalog.appendChild(newItemsContainer);

    // Forzar reflow para la animación
    requestAnimationFrame(() => {
        newItemsContainer.classList.remove('hidden'); // Eliminar clase 'hidden' para mostrar la animación
        newItemsContainer.classList.add('visible'); // Añadir clase 'visible' para mostrar
    });
}

// Función para generar autocompletado y filtrar resultados dinámicamente
function autoComplete() {
    const searchTerm = document.getElementById('search').value.toLowerCase();
    const suggestionBox = document.getElementById('suggestions');
    suggestionBox.innerHTML = ''; // Limpiar sugerencias previas

    if (searchTerm.length > 0) {
        // Filtrar los ítems que coincidan con el término de búsqueda
        const filteredItems = itemsData.filter(item => item.name.toLowerCase().includes(searchTerm));

        // Mostrar los resultados filtrados en el catálogo
        displayItems(filteredItems);

        // Generar sugerencias basadas en los ítems que comienzan con el término de búsqueda
        const suggestions = itemsData
            .filter(item => item.name.toLowerCase().startsWith(searchTerm)) // Buscar ítems que comiencen con el texto escrito
            .map(item => item.name); // Devolver solo los nombres para la lista de sugerencias

        // Mostrar sugerencias si hay coincidencias
        suggestions.forEach(suggestion => {
            const suggestionItem = document.createElement('div');
            suggestionItem.classList.add('suggestion-item');
            suggestionItem.innerText = suggestion;
            suggestionItem.addEventListener('click', () => {
                // Al hacer clic en una sugerencia, llenamos el input y actualizamos la búsqueda
                document.getElementById('search').value = suggestion;
                suggestionBox.innerHTML = ''; // Limpiar sugerencias
                filterItems(); // Aplicar el filtro basado en la selección
            });
            suggestionBox.appendChild(suggestionItem);
        });
    } else {
        // Si el campo está vacío, mostrar todos los ítems
        displayItems(itemsData);
    }
}

// Filtrar ítems según los términos de búsqueda, colores, categorías y mod
function filterItems() {
    const searchTerm = document.getElementById('search').value.toLowerCase();
    
    // Obtener los parámetros desde la URL
    const urlParams = new URLSearchParams(window.location.search);
    const selectedColors = urlParams.get('colors') ? urlParams.get('colors').split(',') : [];
    const selectedCategories = urlParams.get('categories') ? urlParams.get('categories').split(',') : [];
    const selectedMod = urlParams.get('mod') || '';

    const filteredItems = itemsData.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(searchTerm);
        const matchesColors = selectedColors.length === 0 || selectedColors.some(color => item.colors.includes(color));
        const matchesCategories = selectedCategories.length === 0 || selectedCategories.some(category => item.categories.includes(category));
        const matchesMod = !selectedMod || item.mod === selectedMod;

        return matchesSearch && matchesColors && matchesCategories && matchesMod;
    });

    displayItems(filteredItems);
}

// Actualizar los filtros y la URL cuando se seleccionan colores, categorías o mod
function updateFilters() {
    const selectedColors = Array.from(document.querySelectorAll('input[name="color"]:checked')).map(cb => cb.value);
    const selectedCategories = Array.from(document.querySelectorAll('input[name="category"]:checked')).map(cb => cb.value);
    const selectedMod = new URLSearchParams(window.location.search).get('mod') || ''; // El mod puede venir de la URL
    
    // Actualizar la URL con los filtros
    updateURLParams({ colors: selectedColors.join(','), categories: selectedCategories.join(','), mod: selectedMod });
    filterItems();
}

// Filtrar por mod directamente al hacer clic en los botones de mod y actualizar la URL
function filterByMod(mod) {
    updateURLParams({ mod }); // Actualizar la URL con el mod seleccionado
    filterItems();            // Filtrar los ítems
}

// Actualizar los parámetros de la URL sin recargar la página
function updateURLParams(params) {
    const urlParams = new URLSearchParams(window.location.search);
    
    // Actualizar solo las claves especificadas
    Object.keys(params).forEach(key => {
        if (params[key]) {
            urlParams.set(key, params[key]);  // Si el valor está presente, añadir o actualizar
        } else {
            urlParams.delete(key);            // Si no hay valor, eliminar el parámetro
        }
    });

    const newURL = `${window.location.pathname}?${urlParams.toString()}`;
    window.history.pushState({}, '', newURL);  // Cambiar la URL sin recargar
}

// Al cargar la página, aplicar filtros si hay parámetros en la URL
function applyFiltersFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    
    // Colores
    const selectedColors = urlParams.get('colors') ? urlParams.get('colors').split(',') : [];
    selectedColors.forEach(color => {
        const checkbox = document.querySelector(`input[name="color"][value="${color}"]`);
        if (checkbox) checkbox.checked = true;
    });
    
    // Categorías
    const selectedCategories = urlParams.get('categories') ? urlParams.get('categories').split(',') : [];
    selectedCategories.forEach(category => {
        const checkbox = document.querySelector(`input[name="category"][value="${category}"]`);
        if (checkbox) checkbox.checked = true;
    });
    
    // Mod
    const selectedMod = urlParams.get('mod');
    if (selectedMod) {
        document.querySelectorAll(`input[name="mod"][value="${selectedMod}"]`).forEach(input => {
            input.checked = true;
        });
    }

    filterItems();  // Aplicar los filtros
}

// Escuchar los cambios en el input de búsqueda
document.getElementById('search').addEventListener('input', autoComplete);

// Escuchar los cambios en los checkboxes de colores y categorías
document.querySelectorAll('input[name="color"], input[name="category"]').forEach(input => {
    input.addEventListener('change', updateFilters);
});

// Escuchar los cambios en los botones de mod
document.querySelectorAll('.mod-button').forEach(button => {
    button.addEventListener('click', () => filterByMod(button.getAttribute('data-mod')));
});

// ...

// Filtrar por mod directamente al hacer clic en los botones de mod y actualizar la URL
function filterByMod(mod) {
    updateURLParams({ mod }); // Actualizar la URL con el mod seleccionado
    filterItems();            // Filtrar los ítems
}

// Función para mostrar todos los ítems y limpiar el mod en la URL
function showAllItems() {
    updateURLParams({ mod: '' }); // Limpiar el parámetro de mod en la URL
    filterItems();                // Mostrar todos los ítems

    // Desactivar otros botones
    document.querySelectorAll('.mod-button').forEach(button => {
        button.classList.remove('active'); // Elimina clase activa de todos los botones
    });
    document.getElementById('all-button').classList.add('active'); // Añadir clase activa al botón "All"
}

// Escuchar los clics en el botón "All"
document.getElementById('all-button').addEventListener('click', showAllItems);

// Escuchar los cambios en los botones de mod
document.querySelectorAll('.mod-button:not(#all-button)').forEach(button => {
    button.addEventListener('click', () => filterByMod(button.getAttribute('data-mod')));
});
