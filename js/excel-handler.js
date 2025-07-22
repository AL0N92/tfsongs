// excel-handler.js
const ExcelHandler = {
    init() {
        this.setupEventListeners();
    },

    setupEventListeners() {
        const importBtn = document.getElementById('btnImportExcel');
        const fileInput = document.getElementById('excelFileInput');
        
        importBtn.addEventListener('click', () => fileInput.click());
        fileInput.addEventListener('change', (e) => this.handleExcelImport(e));
        
        document.getElementById('btnDownloadTableExcel')?.addEventListener('click', () => this.exportToExcel());
    },

    async handleExcelImport(event) {
        const file = event.target.files[0];
        if (!file) return;

        try {
            const workbook = await this.readExcelFile(file);
            this.processExcelData(workbook);
            event.target.value = ''; // Сброс значения input
        } catch (error) {
            console.error('Excel import error:', error);
            alert(`Ошибка импорта: ${error.message}`);
        }
    },

    readExcelFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                try {
                    const data = new Uint8Array(e.target.result);
                    const workbook = XLSX.read(data, { type: 'array' });
                    resolve(workbook);
                } catch (error) {
                    reject(error);
                }
            };
            
            reader.onerror = () => reject(new Error('Ошибка чтения файла'));
            reader.readAsArrayBuffer(file);
        });
    },

    processExcelData(workbook) {
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        // Проверка формата
        if (jsonData.length < 1 || jsonData[0][0] !== '№') {
            throw new Error('Неверный формат файла! Ожидаются колонки: №, Название песни, Автор');
        }
        
        // Очистка текущих данных
        const inputContainer = document.getElementById('inputContainer');
        inputContainer.innerHTML = '';
        
        // Добавление новых строк
        let hasAuthors = false;
        for (let i = 1; i < jsonData.length; i++) {
            const row = jsonData[i];
            if (!row || !row[1]) continue;
            
            const songName = row[1]?.toString().trim() || '';
            const author = row[2]?.toString().trim() || '';
            
            if (author) hasAuthors = true;
            
            // Используем метод UI для добавления строки
            UI.addInputRow(songName, author);
        }
        
        // Обновление чекбоксов
        const authorCheckbox = document.getElementById('isAuthors');
        const authorOutputCheckbox = document.getElementById('isAuthorsOutput');
        
        authorCheckbox.checked = hasAuthors;
        authorOutputCheckbox.checked = hasAuthors;
        authorOutputCheckbox.disabled = !hasAuthors;
        
        alert(`Успешно загружено ${jsonData.length - 1} песен!`);
    },

    exportToExcel() {
        // Получаем данные через UI
        const songsData = UI.getSongsData();
        
        if (songsData.length === 0) {
            alert('Нет песен для экспорта!');
            return;
        }
        
        // Формируем данные для Excel
        const excelData = [["№", "Название песни", "Автор"]];
        
        songsData.forEach((song, index) => {
            excelData.push([
                index + 1,
                song.name,
                song.author || ''
            ]);
        });
        
        // Создаем книгу Excel
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.aoa_to_sheet(excelData);
        
        // Настраиваем ширину колонок
        const colWidths = [
            { wch: 5 },  // №
            { wch: 40 }, // Название песни
            { wch: 25 }  // Автор
        ];
        ws['!cols'] = colWidths;
        
        // Добавляем лист в книгу
        XLSX.utils.book_append_sheet(wb, ws, "Песни");
        
        // Сохраняем файл
        XLSX.writeFile(wb, 'songs.xlsx');
    }
};

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', () => ExcelHandler.init());