const TableGenerator = {
    canvas: null,
    ctx: null,
    isDarkMode: false,
    
    init() {
        this.canvas = document.getElementById('canvas');
        if (!this.canvas) {
            console.error('Canvas element not found!');
            return;
        }
        
        this.ctx = this.canvas.getContext('2d');
        this.detectColorScheme();
        
        // Привязка обработчика скачивания PNG
        document.getElementById('btnDownloadTablePng')?.addEventListener('click', () => this.downloadPNG());
    },
    
    // Определение цветовой схемы
    detectColorScheme() {
        this.isDarkMode = window.matchMedia && 
                         window.matchMedia('(prefers-color-scheme: dark)').matches;
    },
    
    // Генерация таблицы (основная функция)
    generate() {
        console.log('Starting table generation...');
        console.log('Generate function called');
        console.log('UI module:', typeof UI);
        console.log('Songs data:', this.getSongsData());
        
        // 1. Получаем данные песен
        const songsData = this.getSongsData();
        if (songsData.length === 0) {
            alert('Нет песен для отображения! Добавьте песни в список.');
            return;
        }
        
        // 2. Получаем настройки
        const showAuthors = document.getElementById('isAuthorsOutput').checked;
        const autoSize = document.getElementById('isAutoSize').checked;
        const size = parseInt(document.getElementById('tableSize').value);
        
        // 3. Определяем размер таблицы
        const { rows, cols } = this.calculateTableSize(songsData.length, autoSize, size);
        console.log(`Table size: ${rows}×${cols}`);
        
        // 4. Настраиваем canvas
        this.setupCanvas(rows, cols);
        
        // 5. Рисуем таблицу
        this.drawTable(rows, cols, songsData, showAuthors);
        
        // 6. Показываем кнопки скачивания
        this.showDownloadButtons();
        
        console.log('Table generated successfully!');
    },
    
    // Получаем данные песен из UI
    getSongsData() {
        // Проверяем, существует ли UI модуль с методом getSongsData
        if (typeof UI !== 'undefined' && typeof UI.getSongsData === 'function') {
            return UI.getSongsData();
        }
        
        // Альтернативный способ, если UI модуль недоступен
        console.warn('UI module not available, falling back to direct DOM access');
        const songsData = [];
        const songInputs = document.querySelectorAll('.song-text');
        const authorInputs = document.querySelectorAll('.song-author');
        
        for (let i = 0; i < songInputs.length; i++) {
            const songName = songInputs[i].value.trim();
            const author = authorInputs[i]?.value.trim() || '';
            
            if (songName) {
                songsData.push({ name: songName, author });
            }
        }
        
        return songsData;
    },
    
    // Расчет размера таблицы
    calculateTableSize(songCount, autoSize, fixedSize) {
        if (autoSize) {
            // Авторазмер: вычисляем оптимальное соотношение
            const cols = Math.ceil(Math.sqrt(songCount));
            const rows = Math.ceil(songCount / cols);
            return { rows, cols };
        }
        
        // Фиксированный размер
        const size = fixedSize || 5; // Значение по умолчанию
        return { rows: size, cols: size };
    },
    
    // Настройка canvas
    setupCanvas(rows, cols) {
        // Рассчитываем размеры с учетом отступов
        const maxWidth = Math.min(window.innerWidth * 0.9, 1000);
        const maxHeight = Math.min(window.innerHeight * 0.7, 600);
        
        const cellWidth = maxWidth / cols;
        const cellHeight = Math.min(cellWidth * 0.6, maxHeight / rows);
        
        // Устанавливаем размеры canvas
        this.canvas.width = cellWidth * cols;
        this.canvas.height = cellHeight * rows;
        this.canvas.style.display = 'block';
        
        console.log(`Canvas size: ${this.canvas.width}×${this.canvas.height}`);
    },
    
    getStyleSettings() {
        return {
            textColor: document.getElementById('textColor').value,
            titleFontSize: parseInt(document.getElementById('titleFontSize').value),
            authorFontSize: parseInt(document.getElementById('authorFontSize').value),
            cellBackgroundColor: document.getElementById('cellBackgroundColor').value,
            borderColor: document.getElementById('borderColor').value,
            borderWidth: parseInt(document.getElementById('borderWidth').value)
        };
    },

    // Получение стилей для текущей темы
    getTableStyles() {
    const styles = this.isDarkMode ? {
        background: '#121212',
        border: '#333',
        text: '#e0e0e0',
    } : {
        background: '#f8f9fa',
        border: '#dee2e6',
        text: '#212529',
    };

    // Добавляем пользовательские настройки
    const userStyles = this.getStyleSettings();
    return {
        ...styles,
        headerFont: `bold ${userStyles.titleFontSize}px Roboto`,
        font: `${userStyles.authorFontSize}px Roboto`,
        textColor: userStyles.textColor,
        cellBackgroundColor: userStyles.cellBackgroundColor,
        borderColor: userStyles.borderColor,
        borderWidth: userStyles.borderWidth
    };
},

    
    // Отрисовка таблицы
    drawTable(rows, cols, songsData, showAuthors) {
        const ctx = this.ctx;
        const styles = this.getTableStyles();
        const cellWidth = this.canvas.width / cols;
        const cellHeight = this.canvas.height / rows;
        
        // Заливка фона
        ctx.fillStyle = styles.background;
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Рисуем ячейки
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                const index = row * cols + col;
                if (index >= songsData.length) break;
                
                const x = col * cellWidth;
                const y = row * cellHeight;
                const song = songsData[index];
                
                // Рисуем ячейку
                this.drawCell(ctx, x, y, cellWidth, cellHeight, song, styles, showAuthors);
            }
        }
    },
    
    // Отрисовка отдельной ячейки
    drawCell(ctx, x, y, width, height, song, styles, showAuthors) {
        // Рамка ячейки с пользовательскими настройками
        ctx.strokeStyle = styles.borderColor;
        ctx.lineWidth = styles.borderWidth;
        ctx.strokeRect(x, y, width, height);
        
        // Фон ячейки
        ctx.fillStyle = styles.cellBackgroundColor;
        ctx.fillRect(x + 1, y + 1, width - 2, height - 2);
        
        // Настройки текста
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillStyle = styles.textColor;
        
        // Название песни
        ctx.font = styles.headerFont;
        Utils.wrapText(ctx, song.name, x + width / 2, y + 10, width - 20, 20);
        
        // Автор
        if (showAuthors && song.author) {
            ctx.font = styles.font;
            Utils.wrapText(ctx, `Автор: ${song.author}`, x + width / 2, y + 80, width - 20, 18);
        }
    },
    
    // Показать кнопки скачивания
    showDownloadButtons() {
        const pngBtn = document.getElementById('btnDownloadTablePng');
        const excelBtn = document.getElementById('btnDownloadTableExcel');
        
        if (pngBtn) pngBtn.style.display = 'inline-block';
        if (excelBtn) excelBtn.style.display = 'inline-block';
    },
    
    // Скачивание PNG
    downloadPNG() {
        if (!this.canvas) return;
        
        try {
            const link = document.createElement('a');
            link.download = 'song-table-' + new Date().toISOString().slice(0, 10) + '.png';
            link.href = this.canvas.toDataURL('image/png');
            link.click();
        } catch (error) {
            console.error('Error downloading PNG:', error);
            alert('Ошибка при создании изображения: ' + error.message);
        }
    }
};

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', () => TableGenerator.init());