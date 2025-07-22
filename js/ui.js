// ui.js
const UI = {
    elements: null,
    maxElements: 25, // 5x5 по умолчанию
    splitChars: /["'«»]/,

    init() {
        this.elements = {
            inputContainer: document.getElementById('inputContainer'),
            addBtn: document.getElementById('btnAddRow'),
            authorCheckbox: document.getElementById('isAuthors'),
            authorOutputChechbox: document.getElementById('isAuthorsOutput'),
            autoSizeCheckbox: document.getElementById('isAutoSize'),
            tbSize: document.getElementById('tableSize'),
            toggleBtn: document.getElementById('btnToggleList')
        };

        if (!this.elements.inputContainer) {
            console.error('Input container not found!');
            return;
        }

        // Кнопка скрытия списка
        this.elements.toggleBtn = document.getElementById('btnToggleList');
        this.elements.toggleBtn.addEventListener('click', () => this.toggleListVisibility());
        
        // Начальное состояние кнопки
        if (this.elements.inputContainer.children.length < 2) {
            this.elements.toggleBtn.disabled = true;
        }

        // Установка значений по умолчанию
        this.elements.tbSize.value = 5;
        this.elements.authorCheckbox.checked = true;
        this.elements.authorOutputChechbox.checked = true;
        
        // Обработчики событий
        this.elements.addBtn.addEventListener('click', () => this.addInputRow());
        this.elements.authorCheckbox.addEventListener('change', () => this.handleAuthorChange());
        this.elements.autoSizeCheckbox.addEventListener('change', () => this.handleAutoSizeChange());
        this.elements.tbSize.addEventListener('change', () => this.handleTableSizeChange());
        
        // Добавить первую строку
        this.addInputRow();
    },

    toggleListVisibility() {
        const container = this.elements.inputContainer;
        const btn = this.elements.toggleBtn;
        
        if (!container || !btn) return;
        
        // Переключаем состояние
        const isHidden = container.classList.contains('hidden-list');
        container.classList.toggle('hidden-list', !isHidden);
        
        // Обновляем кнопку
        const icon = btn.querySelector('img');
        const textSpan = btn.querySelector('span');
        
        if (isHidden) {
            icon.src = "https://img.icons8.com/ios/50/hide.png";
            icon.alt = "hide";
            textSpan.textContent = ' Скрыть список';
        } else {
            icon.src = "https://img.icons8.com/ios/50/visible--v1.png";
            icon.alt = "show";
            textSpan.textContent = ' Показать список';
        }
        
        // Сохраняем состояние
        localStorage.setItem('listVisibility', isHidden ? 'visible' : 'hidden');
    },

    handleAuthorChange() {
        // Очищаем контейнер и добавляем новую строку
        this.elements.inputContainer.innerHTML = '';
        this.addInputRow();
        
        // Если авторы отключены, отключаем вывод "Автор:"
        if (!this.elements.authorCheckbox.checked) {
            this.elements.authorOutputChechbox.checked = false;
            this.elements.authorOutputChechbox.disabled = true;
        } else {
            this.elements.authorOutputChechbox.disabled = false;
        }
    },
    
    handleAutoSizeChange() {
        if (this.elements.autoSizeCheckbox.checked) {
            // Режим авторазмера
            this.elements.tbSize.classList.add('disabled-element');
            this.elements.tbSize.disabled = true;
            this.maxElements = Infinity; // нет ограничения
        } else {
            // Фиксированный размер
            this.elements.tbSize.classList.remove('disabled-element');
            this.elements.tbSize.disabled = false;
            this.maxElements = parseInt(this.elements.tbSize.value) ** 2;
        }
        this.updateInputLimits();
    },
    
    handleTableSizeChange() {
        if (!this.elements.autoSizeCheckbox.checked) {
            this.maxElements = parseInt(this.elements.tbSize.value) ** 2;
            this.updateInputLimits();
        }
    },
    
    updateInputLimits() {
        const currentRows = this.elements.inputContainer.children.length;
        
        // Удаляем лишние строки, если превышен лимит
        if (currentRows > this.maxElements && !this.elements.autoSizeCheckbox.checked) {
            while (this.elements.inputContainer.children.length > this.maxElements) {
                this.elements.inputContainer.removeChild(this.elements.inputContainer.lastChild);
            }
        }
        
        // Блокируем кнопку добавления, если достигнут лимит
        this.elements.addBtn.disabled = (
            !this.elements.autoSizeCheckbox.checked && 
            this.elements.inputContainer.children.length >= this.maxElements
        );
    },
    
    updateRowNumbers() {
        const rows = this.elements.inputContainer.querySelectorAll('.song-input');
        rows.forEach((row, index) => {
            const numberSpan = row.querySelector('.song-number');
            if (numberSpan) {
                numberSpan.textContent = `${index + 1}.`;
            }
        });
    },

    addInputRow(songValue = '', authorValue = '') {
        // Ограничение на количество строк
        if (!this.elements.autoSizeCheckbox.checked && 
            this.elements.inputContainer.children.length >= this.maxElements) {
            alert(`Достигнут максимум ${this.maxElements} элементов`);
            return;
        }

        // Проверка на минимальное количество элементов
        if (this.elements.inputContainer.children.length === 0) {
            this.elements.toggleBtn.disabled = true;
        } else if (this.elements.inputContainer.children.length === 1) {
            this.elements.toggleBtn.disabled = false;
        }

        // Если список скрыт - покажем его
        if (this.elements.inputContainer.classList.contains('hidden-list')) {
            this.toggleListVisibility();
        }

        // Проверка заполненности предыдущей строки
        const existingRows = this.elements.inputContainer.querySelectorAll('.song-input');
        if (existingRows.length > 0) {
            const lastRow = existingRows[existingRows.length - 1];
            const lastSongInput = lastRow.querySelector('.song-text');
            const lastAuthorInput = lastRow.querySelector('.song-author');

            if (!lastSongInput.value.trim()) {
                lastSongInput.focus();
                lastSongInput.classList.add('error');
                setTimeout(() => lastSongInput.classList.remove('error'), 1000);
                return;
            }
            
            if (this.elements.authorCheckbox.checked && !lastAuthorInput.value.trim()) {
                lastAuthorInput.focus();
                lastAuthorInput.classList.add('error');
                setTimeout(() => lastAuthorInput.classList.remove('error'), 1000);
                return;
            }
        }

        // Создание элементов строки
        const rowDiv = document.createElement('div');
        rowDiv.classList.add('song-input');

        const rowCount = this.elements.inputContainer.children.length + 1;

        const spanNumber = document.createElement('span');
        spanNumber.classList.add('song-number');
        spanNumber.textContent = `${rowCount}.`;

        const input = document.createElement('input');
        input.classList.add('song-text');
        input.type = 'text';
        input.placeholder = 'Название песни';
        input.value = songValue;

        const inputAuthor = document.createElement('input');
        inputAuthor.classList.add('song-author');
        inputAuthor.type = 'text';
        inputAuthor.placeholder = 'Автор';
        inputAuthor.value = authorValue;

        const deleteBtn = document.createElement('button');
        deleteBtn.innerHTML = '&times;';
        deleteBtn.classList.add('delete-row-btn');
        deleteBtn.title = 'Удалить строку';
        deleteBtn.addEventListener('click', () => {
            rowDiv.remove();
            this.updateRowNumbers();
            this.updateInputLimits();
            
            // Проверка на минимальное количество элементов
            if (this.elements.inputContainer.children.length < 2) {
                this.elements.toggleBtn.disabled = true;
                
                // Если список скрыт - показываем его
                if (this.elements.inputContainer.classList.contains('hidden-list')) {
                    this.toggleListVisibility();
                }
            }
        });
        
        // Сборка строки
        rowDiv.appendChild(spanNumber);
        rowDiv.appendChild(input);
        
        if (this.elements.authorCheckbox.checked) {
            rowDiv.appendChild(inputAuthor);
        }
        
        rowDiv.appendChild(deleteBtn);
        this.elements.inputContainer.appendChild(rowDiv);
        
        // Обработка вставки
        input.addEventListener('paste', e => {
            e.preventDefault();
            const pastedText = e.clipboardData.getData('text');
            const lines = this.processPastedTextToLines(pastedText);
            
            this.elements.inputContainer.innerHTML = '';

            lines.forEach(line => {
                const parsed = this.parseSongInput(line);
                this.addInputRow(parsed?.name || line, parsed?.author || '');
            });
        });

        this.updateRowNumbers();
        this.updateInputLimits();
    },

    // Вспомогательные методы
    processPastedTextToLines(text) {
        return text.split('\n').filter(line => line.trim() !== '');
    },

    parseSongInput(input) {
        const cleanedInput = input.replace(/^\d+[.,)]\s*/, '');
        
        if (cleanedInput.match(this.splitChars)) {
            const parts = cleanedInput.split(this.splitChars);
            if (parts.length >= 3) {
                return {
                    name: parts[1],
                    author: parts.slice(2).join('').trim()
                };
            }
        }
        return null;
    },

    // Метод для получения данных песен
    getSongsData() {
        const songsData = [];
        const songInputs = this.elements.inputContainer.querySelectorAll('.song-text');
        const authorInputs = this.elements.inputContainer.querySelectorAll('.song-author');
        
        for (let i = 0; i < songInputs.length; i++) {
            const songName = songInputs[i].value.trim();
            const author = authorInputs[i]?.value.trim() || '';
            
            if (songName) {
                songsData.push({
                    name: songName,
                    author: author
                });
            }
        }
        
        return songsData;
    }
};