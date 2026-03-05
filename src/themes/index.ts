/**
 * 内置 CSS 主题注册
 * 使用 esbuild 的 text loader 将 .css 文件作为字符串导入
 */
import { CSSTheme, ThemeSource } from '../types/css-theme';

// 导入内置 CSS 主题文件（esbuild 需要配置 text loader）
import defaultCSS from './builtin/default.css';
import elegantCSS from './builtin/elegant.css';
import darkCSS from './builtin/dark.css';
import minimalCSS from './builtin/minimal.css';
import greenFreshCSS from './builtin/green-fresh.css';
import orangeWarmCSS from './builtin/orange-warm.css';
import scarletCSS from './builtin/scarlet.css';
import academicCSS from './builtin/academic.css';

/** 所有内置主题 */
export const builtinThemes: CSSTheme[] = [
    {
        id: 'default',
        name: '默认',
        description: '简洁清爽的默认主题',
        source: ThemeSource.BUILTIN,
        css: defaultCSS,
        author: 'MP Publisher',
        isVisible: true,
    },
    {
        id: 'elegant',
        name: '优雅',
        description: '文艺气质的优雅主题',
        source: ThemeSource.BUILTIN,
        css: elegantCSS,
        author: 'MP Publisher',
        isVisible: true,
    },
    {
        id: 'dark',
        name: '暗色',
        description: '科技感暗色主题',
        source: ThemeSource.BUILTIN,
        css: darkCSS,
        author: 'MP Publisher',
        isVisible: true,
    },
    {
        id: 'minimal',
        name: '极简',
        description: '干净纯粹的极简主题',
        source: ThemeSource.BUILTIN,
        css: minimalCSS,
        author: 'MP Publisher',
        isVisible: true,
    },
    {
        id: 'green-fresh',
        name: '清新绿',
        description: '清新自然的绿色主题',
        source: ThemeSource.BUILTIN,
        css: greenFreshCSS,
        author: 'MP Publisher',
        isVisible: true,
    },
    {
        id: 'orange-warm',
        name: '暖橙',
        description: '温暖活力的橙色主题',
        source: ThemeSource.BUILTIN,
        css: orangeWarmCSS,
        author: 'MP Publisher',
        isVisible: true,
    },
    {
        id: 'scarlet',
        name: '猩红',
        description: '热情醒目的红色主题',
        source: ThemeSource.BUILTIN,
        css: scarletCSS,
        author: 'MP Publisher',
        isVisible: true,
    },
    {
        id: 'academic',
        name: '学术',
        description: '严谨专业的学术主题',
        source: ThemeSource.BUILTIN,
        css: academicCSS,
        author: 'MP Publisher',
        isVisible: true,
    },
];
