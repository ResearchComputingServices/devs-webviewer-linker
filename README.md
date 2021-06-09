# DEVS Webviewer

Plugin for DEVS Webviwer

To use it in your project please reference the `dist/index.js` file in your project.

### Development Usage
```
npm start
```

### Dependencies

```html
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.0-beta3/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-eOJMYsd53ii+scO/bJGFsiCZc+5NDVN2yr8+0RDqr0Ql0h+rP48ckxlpbzKgwra6" crossorigin="anonymous">
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.0.0-beta3/dist/js/bootstrap.bundle.min.js" integrity="sha384-JEW9xMcG8R+pH31jmWH6WWP0WintQrMb4s7ZOdauHnUtxwoG2vI5DkLtS3qm9Ekf" crossorigin="anonymous"></script>
<script src="https://d3js.org/d3.v6.min.js"></script>
```

### Usage

```javascript
var linker = new DEVSWebviewerLinker(document.getElementById('devs-webviewer-linker'), {
    jsonFile,
    svgFile,
    handleClear: () => {
        console.log('handle your own clearing logic here...')
        linker.clear()
    },
    handleReset: () => {
        console.log('handle your own reseting logic here...')
        linker.reset()
    },
    configuration: {
       all: {
            caption: 'All',
            emptyCaption: 'Nothing found',
        },
        nodes: {
            caption: 'Nodes',
            emptyCaption: 'Nothing found',
            contentFilter: (_, value) => {
                return typeof value !== 'object'
            },
        },
        ports: {
            caption: 'Output ports',
            emptyCaption: 'There are no ports for this model',
            filter: (_, value) => {
                return value.type === 'output'
            },
            contentFilter: (key, value) => {
                return key !== 'type' && typeof value !== 'object'
            },
        },
        links: {
            caption: 'Links',
            emptyCaption: 'Nothing found',
            contentFilter: (_, value) => {
                return typeof value !== 'object'
            },
        },
    }
});

await linker.render();
console.log(linker.hasCorruptedAssociations())

setTimeout(() => {
    console.log(linker.getSvg())
    console.log(linker.getJson())
    linker.reset()
    linker.clear()
    linker.destroy()
}, 60000)
```
