import { App, Editor, MarkdownView, Notice, TFile } from 'obsidian';
import type MPPlugin from './main';
import { getPathFromPattern } from './utils/path-utils';
import { getOrCreateMetadata, addImageMetadata, updateMetadata } from './types/metadata';

const IMAGE_EXTENSIONS = new Set(['png', 'jpg', 'jpeg', 'gif', 'webp', 'bmp', 'svg']);

function getExtension(name: string): string {
    const last = name.lastIndexOf('.');
    return last >= 0 ? name.slice(last + 1).toLowerCase() : '';
}

function isImageFile(name: string): boolean {
    return IMAGE_EXTENSIONS.has(getExtension(name));
}

/**
 * 生成资源目录下唯一的文件名（避免覆盖）
 */
function uniqueFileName(originalName: string): string {
    const ext = getExtension(originalName) || 'png';
    const base = originalName.replace(/\.[^/.]+$/, '').replace(/[^\w\u4e00-\u9fa5-]/g, '_') || 'image';
    return `${base}_${Date.now()}.${ext}`;
}

/**
 * 计算从当前文档所在目录到资源文件的相对路径（用于 Markdown 中的图片链接）
 */
function getRelativeImagePath(file: TFile, assetFolderPath: string, fileName: string): string {
    const parentPath = file.parent ? file.parent.path : '';
    const fullAssetPath = `${assetFolderPath}/${fileName}`;
    if (parentPath && fullAssetPath.startsWith(parentPath + '/')) {
        return fullAssetPath.slice((parentPath + '/').length);
    }
    return fullAssetPath;
}

/**
 * 选择本地图片并插入到文档：保存到资源目录、上传到微信素材库、在编辑器中插入 Markdown 链接
 * @param plugin 插件实例
 * @param file 当前文档
 * @param editor 当前编辑器（用于插入链接）；若不传且 insertAtEnd 为 true 则追加到文件末尾
 * @param insertAtEnd 当无 editor 时，是否将图片链接追加到文件末尾
 * @returns 插入的 Markdown 图片语法，失败时返回 null
 */
export function runInsertImage(
    plugin: MPPlugin,
    file: TFile,
    editor?: Editor,
    insertAtEnd: boolean = false
): Promise<string | null> {
    return new Promise((resolve) => {
        if (!file.parent) {
            new Notice('当前文档必须在文件夹中');
            resolve(null);
            return;
        }

        const settings = plugin.settingsManager.getSettings();
        const assetFolderPath = getPathFromPattern(settings.imageAttachmentLocation, file);

        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = async () => {
            const f = input.files?.[0];
            if (!f) {
                resolve(null);
                return;
            }
            if (!isImageFile(f.name)) {
                new Notice('请选择图片文件（支持 png、jpg、gif、webp 等）');
                resolve(null);
                return;
            }

            const fileName = uniqueFileName(f.name);
            let arrayBuffer: ArrayBuffer;
            try {
                arrayBuffer = await f.arrayBuffer();
            } catch (e) {
                new Notice('读取图片失败');
                resolve(null);
                return;
            }

            try {
                // 确保资源目录存在
                const folder = plugin.app.vault.getAbstractFileByPath(assetFolderPath);
                if (!folder) {
                    await plugin.app.vault.createFolder(assetFolderPath);
                }

                const destPath = `${assetFolderPath}/${fileName}`;
                await plugin.app.vault.adapter.writeBinary(destPath, arrayBuffer);

                // 上传到微信素材库
                const uploadResult = await plugin.wechatPublisher.uploadImageAndGetUrl(arrayBuffer, fileName);
                if (!uploadResult) {
                    new Notice('图片已保存到文档资源目录，但上传微信素材库失败');
                    // 仍然插入本地链接
                } else {
                    const metadata = await getOrCreateMetadata(plugin.app.vault, file, assetFolderPath);
                    addImageMetadata(metadata, fileName, {
                        fileName,
                        url: uploadResult.url,
                        media_id: uploadResult.media_id,
                        uploadTime: Date.now(),
                    });
                    await updateMetadata(plugin.app.vault, file, metadata, assetFolderPath);
                    new Notice('图片已插入并上传至微信素材库');
                }

                const relativePath = getRelativeImagePath(file, assetFolderPath, fileName);
                const markdown = `![](${relativePath})`;

                if (editor) {
                    editor.replaceSelection(markdown);
                } else if (insertAtEnd) {
                    const content = await plugin.app.vault.read(file);
                    const newContent = content.trimEnd() + (content.endsWith('\n') ? '' : '\n') + '\n\n' + markdown + '\n';
                    await plugin.app.vault.modify(file, newContent);
                }
                resolve(markdown);
            } catch (err) {
                plugin.logger.error('插入图片失败', err);
                new Notice('插入图片失败');
                resolve(null);
            }
        };
        input.click();
    });
}
