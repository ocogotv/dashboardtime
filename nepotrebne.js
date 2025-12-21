        
let draggedItem = null;
let placeholder = null;


let myChart;
let myChartBig;
let editMode = false;
let currentInfoId = null;
let currentListId = null;

   
        
let lastClickedPanel = null;
let activePanel = null;
let isDragging = false;
let currentX;
let currentY;
let initialX;
let initialY;
let panelPositions = {};

        

const activitiesListBudik = document.querySelector('.budik-list');
let currentColumnsBudik = 1;

             
const activitiesList = document.querySelector('.denni-list');
let currentColumns = 5;


const toggleAllButton = document.getElementById('toggleAll');
let isAllOpen = false;



        
function changeColumnCount(action) {
  const minColumns = 3;
  const maxColumns = 10;
  
  if (action === 'plus' && currentColumns < maxColumns) {
    currentColumns++;
  } else if (action === 'minus' && currentColumns > minColumns) {
    currentColumns--;
  }
  
  activitiesList.style.columnCount = currentColumns;
  activitiesList.style['-webkit-column-count'] = currentColumns;
  activitiesList.style['-moz-column-count'] = currentColumns;
}
        
        
        
function changeColumnCountBudik(action) {
  const minColumnsBudik = 1;
  const maxColumnsBudik = 8;
  
  if (action === 'plus' && currentColumnsBudik < maxColumnsBudik) {
    currentColumnsBudik++;
  } else if (action === 'minus' && currentColumnsBudik > minColumnsBudik) {
    currentColumnsBudik--;
  }
  
  activitiesListBudik.style.columnCount = currentColumnsBudik;
  activitiesListBudik.style['-webkit-column-count'] = currentColumnsBudik;
  activitiesListBudik.style['-moz-column-count'] = currentColumnsBudik;
}
       


        
        function login(event) {
            event.preventDefault();
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            if (username === 'admin' && password === 'password') {
                document.querySelector('.login').classList.add('hidden');
                document.querySelector('.main-content').style.display = 'flex';
                loadSavedData();
            } else {
                alert('Nesprávné uživatelské jméno nebo heslo.');
            }
        }

        function openTab(evt, tabName) {
    // Odstranění active třídy ze všech tlačítek
    const tablinks = document.getElementsByClassName("tabs")[0].getElementsByTagName("button");
    for (let i = 0; i < tablinks.length; i++) {
        tablinks[i].classList.remove("active");
    }
    
    // Přidání active třídy pouze na kliknuté tlačítko
    evt.currentTarget.classList.add("active");
    
    // Skrytí všech obsahů a zobrazení vybraného
    const tabcontent = document.getElementsByClassName("content");
    for (let i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }
    document.getElementById(tabName).style.display = "flex";
}

        


        
        
        
function moveRow(button, direction) {
    const row = button.closest('tr');
    const table = row.closest('table');
    const rows = table.querySelectorAll('tr:not(:first-child)');
    const currentIndex = Array.from(rows).indexOf(row);
    
    if ((direction === 'up' && currentIndex > 0) ||
        (direction === 'down' && currentIndex < rows.length - 1)) {
        const nextRow = direction === 'up' ? rows[currentIndex - 1] : rows[currentIndex + 1];
        // Použijeme tbody jako rodičovský element
        const tbody = table.querySelector('tbody') || table;
        tbody.insertBefore(row, direction === 'up' ? nextRow : nextRow.nextSibling);
        saveData();
    }
}
    
function toggleTableEditMode() {
    const table = document.querySelector('.data-table');
    if (!table) return;
    const editMode = !table.classList.contains('edit-mode');
    table.classList.toggle('edit-mode');
    const rows = table.querySelectorAll('tr:not(:first-child)');
    rows.forEach(row => {
        const controls = row.querySelector('.edit-controls');
        if (controls) {
            controls.style.display = editMode ? 'inline' : 'none';
        }
    });
}     
        
        
 function deleteRow(button) {
    if (confirm('Opravdu chcete smazat tento řádek?')) {
        const row = button.closest('tr');
        row.remove();
        saveData();
    }
}        

    
    
function addData() {
    const inputs = document.querySelectorAll('.data-input, .info-input');
    const hasData = Array.from(inputs).some(input => input.value.trim() !== '');
    if (!hasData) {
        alert('Prosím vyplňte alespoň jedno pole dat.');
        return;
    }
    const table = document.querySelector('.data-table');
    const newRow = table.insertRow(table.rows.length); // Přidání na konec tabulky
    
    // Vytvoření buněk s páry inputů vedle sebe
    for (let i = 0; i < 4; i++) {
        const cell = newRow.insertCell();
        const container = document.createElement('div');
        container.className = 'input-pair';
        // Vytvoření páru inputů (číslo + text)
        const numberInput = document.createElement('input');
        numberInput.type = 'text';
        numberInput.value = document.querySelectorAll('.data-input')[i]?.value || '';
        numberInput.className = 'data-input';
        const textInput = document.createElement('input');
        textInput.type = 'text';
        textInput.value = document.querySelectorAll('.info-input')[i]?.value || '';
        textInput.className = 'info-input';
        container.appendChild(numberInput);
        container.appendChild(textInput);
        cell.appendChild(container);
    }
    // Přidání řídících prvků
    const controlsCell = newRow.insertCell();
    controlsCell.innerHTML = `
        <span class="edit-controls">
            <button onclick="moveRow(this, 'up')" class="move-up">🔼️</button>
            <button onclick="moveRow(this, 'down')" class="move-down">🔽️</button>
            <button onclick="deleteRow(this)">❌</button>
        </span>
    `;
    saveData();
    generateGraph();
    generateGraphBig();
}
    
        
        
        

   function generateGraph() {
    const datasets = [
        {
            label: '1 data',
            borderColor: 'rgba(75, 192, 192, 1)',
            data: [],
            info: []
        },
        {
            label: '2 data',
            borderColor: 'rgba(255, 99, 132, 1)',
            data: [],
            info: []
        },
        {
            label: '3 data',
            borderColor: 'rgba(54, 162, 235, 1)',
            data: [],
            info: []
        },
        {
            label: '4 data',
            borderColor: 'rgba(255, 206, 86, 1)',
            data: [],
            info: []
        }
    ];
    
    // Načtení dat z tabulky
    const table = document.querySelector('.data-table');
    const rows = table.querySelectorAll('tr:not(:first-child)');
    
    rows.forEach(row => {
        const inputs = row.querySelectorAll('.data-input');
        inputs.forEach((input, index) => {
            if (input.value) {
                const value = parseFloat(input.value);
                if (!isNaN(value)) {
                    datasets[index].data.push(value);
                    // Přidání textové informace z info-input
                    const infoInput = row.querySelectorAll('.info-input')[index];
                    datasets[index].info.push(infoInput ? infoInput.value : '');
                }
            }
        });
    });
    
    const ctx = document.getElementById('myChart').getContext('2d');
    if (myChart) myChart.destroy();
    
    myChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: datasets[0].data.map((_, index) => `Data ${index + 1}`),
            datasets: datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    display: true,
                    title: {
                        display: true,
                        text: 'Index'
                    }
                },
                y: {
                    display: true,
                    title: {
                        display: true,
                        text: 'Value'
                    }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const info = context.dataset.info[context.dataIndex];
                            return `${context.dataset.label}: ${context.formattedValue} (${info})`;
                        }
                    }
                }
            }
        }
    });
    saveData();
}
        
        
function generateGraphBig() {
    const datasets = [
        {
            label: '1 data',
            borderColor: 'rgb(93, 163, 253)',
            data: [],
            info: []
        },
        {
            label: '2 data',
            borderColor: 'rgb(62, 92, 255)',
            data: [],
            info: []
        },
        {
            label: '3 data',
            borderColor: 'rgb(3, 31, 179)',
            data: [],
            info: []
        },
        {
            label: '4 data',
            borderColor: 'rgb(1, 18, 106)',
            data: [],
            info: []
        }
    ];
    
    // Načtení dat z tabulky
    const table = document.querySelector('.data-table');
    const rows = table.querySelectorAll('tr:not(:first-child)');
    
    rows.forEach(row => {
        const inputs = row.querySelectorAll('.data-input');
        inputs.forEach((input, index) => {
            if (input.value) {
                const value = parseFloat(input.value);
                if (!isNaN(value)) {
                    datasets[index].data.push(value);
                    // Přidání textové informace z info-input
                    const infoInput = row.querySelectorAll('.info-input')[index];
                    datasets[index].info.push(infoInput ? infoInput.value : '');
                }
            }
        });
    });
    
    const ctxBig = document.getElementById('myChartBig').getContext('2d');
    if (myChartBig) myChartBig.destroy();
    
    myChartBig = new Chart(ctxBig, {
        type: 'line',
        data: {
            labels: datasets[0].data.map((_, index) => `Data ${index + 1}`),
            datasets: datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    display: true,
                    title: {
                        display: true,
                        text: 'Index'
                    }
                },
                y: {
                    display: true,
                    title: {
                        display: true,
                        text: 'Value'
                    }
                }
            },
            plugins: {
                tooltip: {
                    enabled: true,
                    callbacks: {
                        label: function(context) {
                            const info = context.dataset.info[context.dataIndex];
                            return `${context.dataset.label}: ${context.formattedValue} (${info})`;
                        }
                    }
                }
            }
        }
    });
    saveData();
}




function downloadDashboard() {
    const html = document.documentElement.outerHTML;
    const blob = new Blob([html], {type: 'text/html'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'open-source-dashboard.html';
    a.click();
    URL.revokeObjectURL(url);
}  
        
function downloadSampleData() {
 const a = document.createElement('a');
  a.href = 'https://alrs.cz/dashboard_sample_data.json';
  a.download = 'dashboard_sample_data.json';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

        





// Funkce pro změnu tématu
function setTheme(themeName) {
    const body = document.body;
    // Odstranění všech témat
    body.classList.remove('notebook-theme', 'notebook2-theme', 'notebookDt-theme', 'notebook3-theme', 'notebook4-theme', 'minimalist-theme', 'minimalist2-theme', 'minimalist3-theme', 'modern-theme');
    // Přidání vybraného tématu
    body.classList.add(themeName);
    // Uložení výběru
    localStorage.setItem('currentTheme', themeName);
}

// Funkce pro změnu pozadí v notebook designu
function changeBackground() {
    // Definice gradientů pro jednotlivá témata
   const gradients = {
        'notebook-theme': 'linear-gradient(rgba(0,0,0,0.49), rgba(0,0,0,0.49))',
        'notebook2-theme': 'linear-gradient(rgba(255,255,255,0.9), rgba(255,255,255,0.9))',
        'notebookDt-theme': 'linear-gradient(rgba(255,255,255,0.9), rgba(255,255,255,0.9))',
        'notebook3-theme': 'linear-gradient(rgba(0,0,0,0.49), rgba(0,0,0,0.49))',
        'notebook4-theme': 'linear-gradient(rgba(255,255,255,0.9), rgba(255,255,255,0.9))',
        'minimalist-theme': 'linear-gradient(#f5f5f5, #f5f5f5)',
        'minimalist2-theme': 'linear-gradient(#f5f5f5, rgba(0,0,0,0.7))',
        'minimalist3-theme': 'linear-gradient(#fff, #fff)',
        'modern-theme': 'linear-gradient(45deg, #2c3e50, #3498db)'
    };

    // Definice témat, která mají pouze linear gradient bez obrázku
    const linearOnlyThemes = ['minimalist-theme', 'minimalist2-theme', 'minimalist3-theme', 'modern-theme'];

    // Projdeme všechny podporované třídy
    Object.keys(gradients).forEach(themeClass => {
        // Získání existujícího stylu nebo vytvoření nového
        let style = document.querySelector(`style#${themeClass}`);
        if (!style) {
            style = document.createElement('style');
            style.id = themeClass;
            document.head.appendChild(style);
        }

        // Nastavení CSS pro danou třídu
        const css = `.${themeClass} {
            background-image: ${gradients[themeClass]};
            background-size: cover;
            background-attachment: fixed;
        }`;

        // Pokud téma nemá obrázek, použijeme pouze gradient
        if (linearOnlyThemes.includes(themeClass)) {
            style.textContent = css;
        } else {
            // Pro ostatní témata přidáme náhodný obrázek
            const randomSeed = Math.floor(Math.random() * 1000);
            const backgroundImage = `url(https://picsum.photos/seed/${randomSeed}/1920/1080)`;
            style.textContent = `.${themeClass} {
                background-image: ${gradients[themeClass]}, ${backgroundImage};
                background-size: cover;
                background-attachment: fixed;
            }`;
        }
    });
}





let alarmInterval = null;
let currentAlarmSound = null;
let displayedAlarms = new Set();

// Funkce pro zobrazení popupu budíků
function showAlarmPopup() {
    const popup = document.getElementById('alarmPopup');
    const overlay = document.getElementById('alarmOverlay');
    popup.style.display = 'block';
    overlay.style.display = 'block';
    loadAlarms();
}

// Funkce pro zavření popupu budíků
function closeAlarmPopup() {
    document.querySelectorAll('.popup, .popup-overlay').forEach(element => {
        element.style.display = 'none';
    });
}

// Funkce pro přidání nového budíku
function addAlarm() {
    const timeInput = document.getElementById('alarmTime');
    const descriptionInput = document.getElementById('alarmDescription');
    
    const time = timeInput.value;
    const description = descriptionInput.value.trim();
    
    if (!time || !description) {
        alert('Please enter both the time and the alarm description.');
        return;
    }
    
    const alarmId = getNextActivityId(description);
    
    const alarm = {
        id: alarmId,
        time: time,
        description: description,
        active: true
    };
    
    saveAlarmToStorage(alarm);
    renderAlarmList();
    
    timeInput.value = '';
    descriptionInput.value = '';
    saveData();
}

// Funkce pro načtení budíků ze storage
function loadAlarms() {
    const alarms = JSON.parse(localStorage.getItem('alarms') || '[]');
    renderAlarmList(alarms);
    startAlarmChecker();
}

// Funkce pro uložení budíku do storage
function saveAlarmToStorage(alarm) {
    const alarms = JSON.parse(localStorage.getItem('alarms') || '[]');
    alarms.push(alarm);
    localStorage.setItem('alarms', JSON.stringify(alarms));
}

// Funkce pro vykreslení seznamu budíků
function renderAlarmList(alarms = null) {
    const list = document.getElementById('alarmList');
    list.innerHTML = '';
    
    const alarmList = alarms || JSON.parse(localStorage.getItem('alarms') || '[]');
    alarmList.forEach(alarm => {
        const li = document.createElement('li');
        li.className = 'alarm-item';
        li.dataset.alarmId = alarm.id;
        
        li.innerHTML = `
            <span class="alarm-time">${alarm.time}</span>
            <span class="alarm-description">${alarm.description}</span>
            <div class="alarm-controls">
                <div class="alarm-move-controls">
                    <button onclick="moveAlarm('${alarm.id}', 'up')" class="move-up">🔼️</button>
                    <button onclick="moveAlarm('${alarm.id}', 'down')" class="move-down">🔽️</button>
                </div>
                <span class="edit-controls">
                    <button onclick="editAlarm('${alarm.id}')">✏️</button>
                    <button onclick="deleteAlarm('${alarm.id}')">❌</button>
                    <label class="alarm-toggle">
                        <input type="checkbox" ${alarm.active ? 'checked' : ''} 
                               onchange="toggleAlarm('${alarm.id}')">
                        <span></span>
                    </label>
                </span>
            </div>
        `;
        list.appendChild(li);
    });
}

// Funkce pro přesouvání budíků
function moveAlarm(alarmId, direction) {
    const list = document.getElementById('alarmList');
    const alarmElement = list.querySelector(`[data-alarm-id="${alarmId}"]`);
    if (!alarmElement) return;

    const currentIndex = Array.from(list.children).indexOf(alarmElement);
    
    if (direction === 'up' && currentIndex > 0) {
        const previousElement = list.children[currentIndex - 1];
        list.insertBefore(alarmElement, previousElement);
    } else if (direction === 'down' && currentIndex < list.children.length - 1) {
        const nextElement = list.children[currentIndex + 1];
        list.insertBefore(alarmElement, nextElement.nextSibling);
    }

    saveAlarmOrder();
}

// Funkce pro uložení pořadí budíků
function saveAlarmOrder() {
    const list = document.getElementById('alarmList');
    const alarms = JSON.parse(localStorage.getItem('alarms') || '[]');
    const newOrder = Array.from(list.children).map(li => li.dataset.alarmId);
    
    const reorderedAlarms = alarms.map((alarm, index) => ({
        ...alarm,
        order: newOrder.indexOf(alarm.id)
    }));
    
    localStorage.setItem('alarms', JSON.stringify(reorderedAlarms));
    saveData();
}

// Funkce pro úpravu budíku
function editAlarm(alarmId) {
    const alarms = JSON.parse(localStorage.getItem('alarms') || '[]');
    const alarm = alarms.find(a => a.id === alarmId);
    
    if (!alarm) return;
    
    const newTime = prompt('New time:', alarm.time);
    const newDescription = prompt('New description:', alarm.description);
    
    if (newTime && newDescription) {
        alarm.time = newTime;
        alarm.description = newDescription;
        localStorage.setItem('alarms', JSON.stringify(alarms));
        renderAlarmList();
    }
    saveData();
}

// Funkce pro smazání budíku
function deleteAlarm(alarmId) {
    if (confirm('Do you really want to delete this alarm?')) {
        const alarms = JSON.parse(localStorage.getItem('alarms') || '[]');
        const filteredAlarms = alarms.filter(a => a.id !== alarmId);
        localStorage.setItem('alarms', JSON.stringify(filteredAlarms));
        renderAlarmList();
    }
    saveData();
}

// Funkce pro přepínání aktivity budíku
function toggleAlarm(alarmId) {
    const alarms = JSON.parse(localStorage.getItem('alarms') || '[]');
    const alarm = alarms.find(a => a.id === alarmId);
    if (alarm) {
        alarm.active = !alarm.active;
        localStorage.setItem('alarms', JSON.stringify(alarms));
    }
}

// Funkce pro kontrolu budíků
function startAlarmChecker() {
    if (alarmInterval) clearInterval(alarmInterval);
    alarmInterval = setInterval(() => {
        // Získání času v 24hodinovém formátu bez závislosti na lokálních nastaveních
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const currentTime = `${hours}:${minutes}`;
        
        const alarms = JSON.parse(localStorage.getItem('alarms') || '[]');
        alarms.forEach(alarm => {
            if (alarm.active && alarm.time === currentTime) {
                // Kontrola, zda nebyl tento budík již zobrazen v tomto časovém intervalu
                const alarmKey = `${alarm.id}-${currentTime}`;
                if (!displayedAlarms.has(alarmKey)) {
                    triggerAlarm(alarm);
                    displayedAlarms.add(alarmKey);
                }
            }
        });
        
        // Vyčištění již zobrazených budíků z předchozích minut
        const currentMinute = now.getMinutes();
        displayedAlarms = new Set([...displayedAlarms].filter(key => {
            const minute = parseInt(key.split('-')[1].split(':')[1]);
            return Math.abs(currentMinute - minute) <= 1;
        }));
    }, 1000);
}

// Funkce pro spuštění budíku
function triggerAlarm(alarm) {
    // Odstranění existujícího alarmu, pokud existuje
    const existingAlarm = document.querySelector('.alarm-sound');
    if (existingAlarm) {
        existingAlarm.remove();
    }
    
    // Zobrazení popupu budíku
    const soundPopup = document.createElement('div');
    soundPopup.className = 'alarm-sound';
    soundPopup.innerHTML = `
        <h3>Alarm!</h3>
        <p>${alarm.description}</p>
        <button onclick="closeAlarm()">Close</button>
    `;
    document.body.appendChild(soundPopup);
    
    // Přehrání zvuku
    if (currentAlarmSound) {
        currentAlarmSound.pause();
        currentAlarmSound = null;
    }
    
    currentAlarmSound = new Audio('https://alrs.cz/budik.wav');
    currentAlarmSound.loop = true;
    currentAlarmSound.play();
}

// Funkce pro zavření budíku
function closeAlarm() {
    if (currentAlarmSound) {
        currentAlarmSound.pause();
        currentAlarmSound = null;
    }
    
    const soundPopup = document.querySelector('.alarm-sound');
    if (soundPopup) {
        soundPopup.remove();
    }
    
    // Přidání času zavření do localStorage pro zachování stavu
    const currentTime = new Date().toLocaleTimeString('cs-CZ', { 
        hour: '2-digit', 
        minute: '2-digit' 
    });
    localStorage.setItem('lastAlarmCloseTime', currentTime);
}     
        





        
document.getElementById('custom-menu-start').addEventListener('click', function() {
    document.querySelector('.custom-menu-container').classList.toggle('custom-menu-open');
});

document.querySelectorAll('.custom-tab-btn').forEach(button => {
    button.addEventListener('click', function() {
        document.querySelectorAll('.custom-tab-btn').forEach(btn => btn.classList.remove('custom-tab-active'));
        this.classList.add('custom-tab-active');

        const tabId = this.dataset.tab;
        document.querySelectorAll('.custom-content-window').forEach(content => {
            content.classList.remove('custom-content-active');
        });
        document.getElementById(`custom-content-${tabId}`).classList.add('custom-content-active');
    });
});

// Zavření menu kliknutím vedle něj
document.addEventListener('click', function(e) {
    const menu = document.querySelector('.custom-menu-container');
    const startButton = document.getElementById('custom-menu-start');
    
    if (!menu.contains(e.target) && e.target !== startButton) {
        menu.classList.remove('custom-menu-open');
    }
});
        











function playSound() {
    const audio = new Audio('https://alrs.cz/proces.mp3');
    audio.play().catch(error => {
        console.error('Chyba při přehrávání zvuku:', error);
    });
}
 

 // Definice playlistu - zde můžete přidávat své vlastní skladby
        const playlist = [
            { nazev: 'Clemens Ruh - Bloodcry', soubor: 'https://alrs.cz/bloodcry-clemens-ruh.mp3' },
            { nazev: 'Dorian Pinto - Aurora Borealis', soubor: 'https://alrs.cz/aurora-borealis-dorian-pinto.mp3' },
            { nazev: 'Simon Folwar - Heroes edited Dj Oxis', soubor: 'https://alrs.cz/heroes-simon-folwar-edited dj oxis.mp3' }
        ];

        let aktualniIndex = 0;
        const hudba = document.getElementById('hudba');
        const nazevSkaldby = document.getElementById('nazevSkaldby');
        const tlacitkoPrehrani = document.getElementById('tlacitkoPrehrani');
        const pokrok = document.getElementById('pokrok');
        const cas = document.getElementById('cas');
        const playlistElement = document.getElementById('playlist');
        const posuvnik = document.getElementById('posuvnik');

const posuvnikHlasitosti = document.getElementById('posuvnikHlasitosti');
const hodnotaHlasitosti = document.getElementById('hodnotaHlasitosti');

// Funkce pro aktualizaci hlasitosti
function aktualizujHlasitost() {
    const novaHodnota = posuvnikHlasitosti.value;
    hudba.volume = novaHodnota / 100;
    hodnotaHlasitosti.textContent = `${novaHodnota}%`;
}

// Přidání event listenerů pro posuvník hlasitosti
posuvnikHlasitosti.addEventListener('input', aktualizujHlasitost);

        // Načtení playlistu při načtení stránky
        window.onload = function() {
            playlist.forEach((skladba, index) => {
                const prvek = document.createElement('div');
                prvek.className = 'skladba';
                prvek.innerHTML = skladba.nazev;
                prvek.onclick = () => spustSkladbu(index);
                playlistElement.appendChild(prvek);
            });
            
            nactiSkladbu();
            aktualizujHlasitost();
        };

        function spustSkladbu(index) {
            aktualniIndex = index;
            nactiSkladbu();
            prehraj();
        }

        function nactiSkladbu() {
            const skladba = playlist[aktualniIndex];
            hudba.src = skladba.soubor;
            nazevSkaldby.textContent = skladba.nazev;
            aktualizujPlaylist();
        }

        function aktualizujPlaylist() {
            const skladby = playlistElement.getElementsByClassName('skladba');
            Array.from(skladby).forEach((prvek, index) => {
                prvek.classList.remove('hranici');
                if (index === aktualniIndex) {
                    prvek.classList.add('hranici');
                }
            });
        }

        function prehraj() {
            if (hudba.paused) {
                hudba.play();
                tlacitkoPrehrani.textContent = '⏸';
            } else {
                hudba.pause();
                tlacitkoPrehrani.textContent = '▶';
            }
        }

        function dalsiSkladbu() {
            aktualniIndex = (aktualniIndex + 1) % playlist.length;
            nactiSkladbu();
            prehraj();
        }

        function predchoziSkladbu() {
            aktualniIndex = (aktualniIndex - 1 + playlist.length) % playlist.length;
            nactiSkladbu();
            prehraj();
        }

        // Přeskočení v písničce
        posuvnik.addEventListener('click', function(e) {
            const rect = this.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const procento = (x / rect.width) * 100;
            
            hudba.currentTime = (procento / 100) * hudba.duration;
            pokrok.style.width = `${procento}%`;
        });

        // Aktualizace progress baru
        hudba.addEventListener('timeupdate', aktualizujProgress);
        hudba.addEventListener('loadedmetadata', nastavitCelkovyCas);

        function aktualizujProgress() {
            const procento = (hudba.currentTime / hudba.duration) * 100;
            pokrok.style.width = `${procento}%`;
            cas.textContent = formatujCas(hudba.currentTime) + 
                            ' / ' + formatujCas(hudba.duration);
        }

        function nastavitCelkovyCas() {
            cas.textContent = formatujCas(hudba.currentTime) + 
                            ' / ' + formatujCas(hudba.duration);
        }

        function formatujCas(sekundy) {
            const minuty = Math.floor(sekundy / 60);
            sekundy = Math.floor(sekundy % 60);
            return `${minuty}:${sekundy < 10 ? '0' : ''}${sekundy}`;
        }

        // Automatické přehrávání další skladby
        hudba.addEventListener('ended', dalsiSkladbu);
        



let isMuted = false;
const audioElements = {
    hoverSound: document.getElementById('hoverSound'),
    clickSound: document.getElementById('clickSound'),
    musicPlayer: document.getElementById('hudba'),
    bassSound: document.getElementById('bassSound'),
    woshSound: document.getElementById('woshSound')
};

function toggleMute() {
    isMuted = !isMuted;
    const muteButton = document.getElementById('muteButton');
    muteButton.classList.toggle('muted');
    muteButton.textContent = isMuted ? '🔇' : '🔊';
    
    Object.values(audioElements).forEach(audio => {
        if (audio) {
            audio.muted = isMuted;
        }
    });
    
localStorage.setItem('isMuted', isMuted);
   
}






function makeUrlsClickable(textarea) {
    const content = textarea.value;
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const matches = content.match(urlRegex);
    
    if (!matches) {
        return content;
    }

    const container = document.createElement('div');
    container.className = 'clickable-content';
    
    // Nejdřív vytvoříme všechny odkazy
    matches.forEach(url => {
        const link = document.createElement('a');
        link.href = url;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.textContent = url;
        link.className = 'clickable-url';
        link.style.display = 'block';
        container.appendChild(link);
    });
    
    return container;
}