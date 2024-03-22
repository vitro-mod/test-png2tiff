const IMAGES_DIR = 'images';
const COLUMNS = 4;
const BACKGROUND = '#fff';
const TILE_WIDTH = 200;
const TILE_GAP = 30;

const fs = require('fs');
const Jimp = require("jimp");

let filenames = [];
try {
    // Читаем все переданные директории
    for (const folder of process.argv.slice(2)) {

        // Получаем содержимое директории
        let folderFiles = fs.readdirSync(`./${IMAGES_DIR}/${folder}`);
        folderFiles = folderFiles.map(file => `./${IMAGES_DIR}/${folder}/${file}`);
        filenames = filenames.concat(folderFiles);
    }

    // Фильтруем, чтобы оставить в списке только интересующие нас *.png*
    filenames = filenames.filter(filename => filename.endsWith('.png'));
} catch (error) {
    console.error('Не удалось прочитать содержимое директории.');
    return;
}

try {
    // Вычисляем размеры изображения на выходе
    const resultRows = Math.ceil(filenames.length / COLUMNS);
    const resultWidth = TILE_WIDTH * COLUMNS + TILE_GAP * (COLUMNS + 1);
    const resultHeight = TILE_WIDTH * resultRows + TILE_GAP * (resultRows + 1);

    // Создаём новое изображение
    new Jimp(resultWidth, resultHeight, BACKGROUND, async (err, image) => {
        if (err) throw err;

        // Читаем изображения
        const imagesReadPromises = filenames.map(filename => Jimp.read(filename));
        console.log(`Прочитано ${filenames.length} файлов.`);

        const tileImages = await Promise.all(imagesReadPromises);
        for (let i = 0; i < tileImages.length; i++) {
            let tileImage = tileImages[i];

            // Уменьшаем изображение до требуемого размера
            tileImage = tileImage.resize(TILE_WIDTH, TILE_WIDTH);

            // Вычисляем координаты текущей картинки
            const x = TILE_GAP + (TILE_GAP + TILE_WIDTH) * (i % COLUMNS);
            const y = TILE_GAP + (TILE_GAP + TILE_WIDTH) * Math.trunc(i / COLUMNS);

            // Помещаем текущую картинку на итоговое изображение
            image.blit(tileImage, x, y);

            console.log(`Обработано ${i + 1} из ${tileImages.length} изображений.`);
        }
        image.write('result.tif');
    });
} catch (error) {
    console.error(error);
    return;
}
