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
// You can choose whatever container div you want this plugin to attach to.
var elem = document.getElementById('devs-webviewer-linker');
// You can pass your own configurations as well.
var configurations = {}

var linker = new DEVSWebviewerLinker(elem, configurations);
linker.render();

var jsonContent = linker.getJSON();
var svgContent = linker.getSVG();

setTimeout(function() {
    var results = linker.destroy();
    var jsonContent = results.jsonContent;
    var svgContent = results.svgContent;
}, 5000);
```
