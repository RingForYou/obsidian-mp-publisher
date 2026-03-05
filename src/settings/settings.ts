import { CSSTheme, FontOption, DEFAULT_FONTS, RemoteThemeIndex } from '../types/css-theme';

export interface MPSettings {
    // 主题设置
    activeThemeId: string;
    fontFamily: string;
    fontSize: number;
    customFonts: FontOption[];
    downloadedRemoteThemes: CSSTheme[];
    remoteThemeIndexCache?: RemoteThemeIndex[];
    remoteIndexLastUpdate?: number;
    // 微信公众号相关设置
    wechatAppId: string;
    wechatAppSecret: string;
    imageAttachmentLocation: string;
    debugMode: boolean;
}

const DEFAULT_SETTINGS: MPSettings = {
    // 主题默认设置
    activeThemeId: 'default',
    fontFamily: DEFAULT_FONTS[0].value,
    fontSize: 16,
    customFonts: [...DEFAULT_FONTS],
    downloadedRemoteThemes: [],
    // 微信公众号默认设置
    wechatAppId: '',
    wechatAppSecret: '',
    imageAttachmentLocation: '${filename}__assets',
    debugMode: false,
};

export class SettingsManager {
    private plugin: any;
    private settings: MPSettings;

    constructor(plugin: any) {
        this.plugin = plugin;
        this.settings = { ...DEFAULT_SETTINGS };
    }

    async loadSettings(): Promise<void> {
        const savedData = (await this.plugin.loadData()) || {};

        // 迁移旧设置：如果有旧的 templateId，映射到 activeThemeId
        if (savedData.templateId && !savedData.activeThemeId) {
            savedData.activeThemeId = savedData.templateId;
        }

        // 确保 customFonts 存在
        if (!savedData.customFonts || savedData.customFonts.length === 0) {
            savedData.customFonts = [...DEFAULT_FONTS];
        }

        // 确保 downloadedRemoteThemes 存在
        if (!savedData.downloadedRemoteThemes) {
            savedData.downloadedRemoteThemes = [];
        }

        this.settings = { ...DEFAULT_SETTINGS, ...savedData };
    }

    async saveSettings(): Promise<void> {
        await this.plugin.saveData(this.settings);
    }

    getSettings(): MPSettings {
        return this.settings;
    }

    async updateSettings(updates: Partial<MPSettings>): Promise<void> {
        this.settings = { ...this.settings, ...updates };
        await this.saveSettings();
    }

    getFontOptions(): FontOption[] {
        return this.settings.customFonts;
    }
}