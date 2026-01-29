
/**
 * Converte um arquivo de imagem para WebP com compressão.
 * @param file Arquivo de imagem original (File)
 * @param quality Qualidade da compressão (0 a 1, padrão 0.8)
 * @returns Promise que resolve com o novo File em formato WebP
 */
export async function convertToWebP(file: File, quality = 0.8): Promise<File> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);

        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target?.result as string;

            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;

                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    reject(new Error('Não foi possível criar contexto do canvas'));
                    return;
                }

                ctx.drawImage(img, 0, 0);

                canvas.toBlob(
                    (blob) => {
                        if (!blob) {
                            reject(new Error('Falha na conversão para WebP'));
                            return;
                        }

                        // Criar novo arquivo com extensão .webp
                        const newFileName = file.name.replace(/\.[^.]+$/, '') + '.webp';
                        const newFile = new File([blob], newFileName, {
                            type: 'image/webp',
                            lastModified: Date.now(),
                        });

                        resolve(newFile);
                    },
                    'image/webp',
                    quality
                );
            };

            img.onerror = (error) => reject(error);
        };

        reader.onerror = (error) => reject(error);
    });
}
