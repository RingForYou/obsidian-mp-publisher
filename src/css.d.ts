/** 声明 .css 文件模块，esbuild 使用 text loader 将其作为字符串导入 */
declare module '*.css' {
    const content: string;
    export default content;
}
