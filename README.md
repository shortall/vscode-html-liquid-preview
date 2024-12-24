# HTML Liquid Preview for Visual Studio Code

Gives a rendered live preview for HTML based liquid templates. It uses the [liquidjs](https://www.npmjs.com/package/liquidjs) npm package to do the rendering. Formatting of the template can be done by a separate command and is powered by [Prettier](https://www.npmjs.com/package/prettier) and the [Shopify Prettier Liquid Plugin](https://www.npmjs.com/package/@shopify/prettier-plugin-liquid)


This extension was inspired by [YE Quing's](https://github.com/yq314) - [Braze Liquid Preview](https://github.com/yq314/vscode-braze-liquid-preview)

Which in turn was inspired by [Trevor Kirchner's](https://github.com/kirchner-trevor) - [Shopify Liquid Preview](https://github.com/kirchner-trevor/vscode-shopify-liquid-preview).

For my main use case of liquid it's handy to get the live rendered output you get with the Braze plugin. However I didn't need the braze extensions and I did want it to support all the standard liquid syntax. 

I also liked the idea of being able to format the template. That functionality is included in the Shopify Liquid Preview extension however it wasn't working for me. I've added it as a separate command so as not to interfere with any other formatter that may have already been setup.

## Features

- Live preview for HTML Liquid templates, updating as you type
- Support for fake data. Assuming your template file name is `template.liquid`, add a file `template.liquid.json` in the same directory to be a context of the template
- Ability to format the source template

## Usage

Use the keybinding `ctrl+shift+p` to launch the command pallet. this extension makes 2 new commands available:
- HTML Liquid: Preview
- HTML Liquid: Format Template

## Running locally

Running with `npm`
```
npm install
npm run test
```

Test your extension with [Visual Studio Code](https://code.visualstudio.com/api/working-with-extensions/testing-extension)