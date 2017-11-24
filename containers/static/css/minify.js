const fs = require('fs');
const CleanCSS = require('clean-css');

const fileMap = {
    './orig/ocui-bootstrap-bundle-0.1.2.css' : './ocui-bootstrap-bundle-0.1.2.min.css',
    './orig/Main.css' : './Main.min.css'
}

for(const orig in fileMap)
{
    fs.writeFileSync(fileMap[orig], new CleanCSS().minify(fs.readFileSync(orig, 'utf8')).styles);
}
