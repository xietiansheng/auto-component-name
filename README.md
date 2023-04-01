# auto-component-name
This plugin is mainly used to automatically modify component names and make the VueDevTools tool look more intuitive

## Install
```bash 
npm install vite-plugin-vue-auto-component-name
```
## Configuration 
```ts
// vite.config.ts
import AutoComponentName from "vite-plugin-vue-auto-component-name";

export default defineConfig(() => ({
  plugins: [
    vue(),
    AutoComponentName(),
  ]
}))
```

## Effect
![](/assets/image/vue_dev_tool.png)
![](/assets/image/ide_dir.png)
