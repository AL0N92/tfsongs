const Utils = {
    // Парсинг введенной строки песни
    parseSongInput(input) {
        const cleanedInput = input.replace(/^\d+[.,)]\s*/, ''); // Удаление нумерации
        const splitChars = /["'«»„“]/; // Регулярка для кавычек
        
        // Проверка на наличие кавычек
        if (cleanedInput.match(splitChars)) {
            const parts = cleanedInput.split(splitChars);
            if (parts.length >= 3) {
                return {
                    name: parts[1].trim(),
                    author: parts.slice(2).join('').trim()
                };
            }
        }
        return null;
    },

    // Обработка вставленного текста
    processPastedTextToLines(text) {
        return text.split('\n')
            .map(line => line.trim())
            .filter(line => line !== '');
    },

    // Перенос текста в canvas
    wrapText(ctx, text, x, y, maxWidth, lineHeight) {
        const words = text.split(' ');
        let line = '';
        let currentY = y;
        
        for (let n = 0; n < words.length; n++) {
            const testLine = line + words[n] + ' ';
            const metrics = ctx.measureText(testLine);
            
            if (metrics.width > maxWidth && n > 0) {
                ctx.fillText(line, x, currentY);
                line = words[n] + ' ';
                currentY += lineHeight;
            } else {
                line = testLine;
            }
        }
        ctx.fillText(line, x, currentY);
    },

    // Генерация случайного цвета с учетом яркости
    getRandomColor(minBrightness = 150) {
        let r, g, b;
        do {
            r = Math.floor(Math.random() * 256);
            g = Math.floor(Math.random() * 256);
            b = Math.floor(Math.random() * 256);
            // Рассчитываем яркость по формуле Y = 0.299*R + 0.587*G + 0.114*B
        } while ((0.299 * r + 0.587 * g + 0.114 * b) < minBrightness);
        
        return `rgb(${r}, ${g}, ${b})`;
    },
    setStandartColor(){
        return `rgb(192, 198, 202)`;
    }
};

// Делаем функции доступными глобально, если нужно
window.Utils = Utils;