const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const projectRoot = path.join(__dirname, '..');

const targets = [
    {
        input: path.join(projectRoot, 'src', 'assets', 'images', 'projects', 'coldstorage.gif'),
        output: path.join(projectRoot, 'src', 'assets', 'images', 'projects', 'coldstorage.webp'),
        options: { animated: true, quality: 80 }
    },
    {
        input: path.join(projectRoot, 'src', 'assets', 'images', 'baseImages', 'profile.png'),
        output: path.join(projectRoot, 'src', 'assets', 'images', 'baseImages', 'profile.webp'),
        options: { quality: 80 }
    },
    {
        input: path.join(projectRoot, 'public', 'images', 'wallpapers', 'lockScreenWall.jpg'),
        output: path.join(projectRoot, 'public', 'images', 'wallpapers', 'lockScreenWall.webp'),
        options: { quality: 80 }
    }
];

async function optimizeImages() {
    console.log('Starting image optimization...');

    for (const target of targets) {
        try {
            if (!fs.existsSync(target.input)) {
                console.warn(`Input file not found: ${target.input}`);
                continue;
            }

            const inputStats = fs.statSync(target.input);
            const inputSizeMB = (inputStats.size / (1024 * 1024)).toFixed(2);

            console.log(`Optimizing ${path.basename(target.input)} (${inputSizeMB} MB)...`);

            await sharp(target.input, { ...target.options, limitInputPixels: false })
                .toFile(target.output);

            const outputStats = fs.statSync(target.output);
            const outputSizeMB = (outputStats.size / (1024 * 1024)).toFixed(2);
            const reduction = ((1 - (outputStats.size / inputStats.size)) * 100).toFixed(2);

            console.log(`✅ Generated ${path.basename(target.output)} (${outputSizeMB} MB) - ${reduction}% reduction`);

        } catch (error) {
            console.error(`❌ Error optimizing ${path.basename(target.input)}:`, error);
        }
    }

    console.log('Optimization complete!');
}

optimizeImages();
