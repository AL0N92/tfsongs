document.addEventListener('DOMContentLoaded', () => {
    // Инициализация модулей
    if (typeof UI !== 'undefined') UI.init();
    if (typeof ExcelHandler !== 'undefined') ExcelHandler.init();
    TableGenerator.init();
    
    // Привязка обработчика генерации таблицы
    const generateBtn = document.getElementById('btnGenerateTable');
    if (generateBtn) {
        generateBtn.addEventListener('click', () => {
            console.log('Generate button clicked');
            TableGenerator.generate();
        });
    } else {
        console.error('Generate button not found!');
    }
    
    // Обработчик изменения темы
    const colorSchemeQuery = window.matchMedia('(prefers-color-scheme: dark)');
    if (colorSchemeQuery.addEventListener) {
        colorSchemeQuery.addEventListener('change', e => {
            TableGenerator.isDarkMode = e.matches;
        });
    }

    // Обработчики для обновления значений
    document.getElementById('titleFontSize').addEventListener('input', function() {
        document.getElementById('titleFontSizeValue').textContent = `${this.value}px`;
    });
    
    document.getElementById('authorFontSize').addEventListener('input', function() {
        document.getElementById('authorFontSizeValue').textContent = `${this.value}px`;
    });
    
    document.getElementById('borderWidth').addEventListener('input', function() {
        document.getElementById('borderWidthValue').textContent = `${this.value}px`;
    });
    
    // Сохранение настроек в LocalStorage
    const styleInputs = document.querySelectorAll('.style-settings input');
    styleInputs.forEach(input => {
        input.addEventListener('change', function() {
            localStorage.setItem(this.id, this.value);
        });
    });
    
    // Восстановление настроек
    styleInputs.forEach(input => {
        const savedValue = localStorage.getItem(input.id);
        if (savedValue) {
            input.value = savedValue;
            // Обновляем текстовые значения
            if (input.type === 'range') {
                document.getElementById(`${input.id}Value`).textContent = 
                    `${savedValue}${input.id === 'borderWidth' ? 'px' : ''}`;
            }
        }
    });
    
    // Инициализация темы
    TableGenerator.isDarkMode = colorSchemeQuery.matches;

    UI.init();
    
    // Восстановление состояния списка
    const listVisibility = localStorage.getItem('listVisibility');
    const container = UI.elements.inputContainer;
    const btn = UI.elements.toggleBtn;
    
    if (container && btn) {
        if (listVisibility === 'hidden') {
            container.classList.add('hidden-list');
            
            // Обновляем кнопку
            const icon = btn.querySelector('img');
            const textSpan = btn.querySelector('span');
            
            icon.src = "https://img.icons8.com/ios/50/visible--v1.png";
            icon.alt = "show";
            textSpan.textContent = ' Показать список';
        }
    }
});