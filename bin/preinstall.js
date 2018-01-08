var fs = require('fs')
var path = require('path');
var resolve = require('path').resolve;
var join = require('path').join;
var cp = require('child_process');

// get library path
var lib = resolve(__dirname, '../src/')

// https://gist.github.com/kethinov/6658166
// List all files in a directory in Node.js recursively in a synchronous fashion
const read = (dir, filename) =>
  fs.readdirSync(dir)
    .reduce((files, file) => {
      var fsPath = fs.statSync(path.join(dir, file));
      var fileObject = path.parse(path.join(dir, file));
      return fsPath.isDirectory() && !fileObject.dir.includes('node_modules') ?
        files.concat(read(path.join(dir, file), filename)) :
        file === filename ? files.concat(dir) : files
      },
      []);

var list = read(lib, 'package.json');

var current = 0;
var limit = list.length;

function queue(list) {
  const mod = list[current];
  fs.accessSync(join(mod, 'package.json'));

  const fileObject = path.parse(join(mod, 'package.json'));

  console.log('------------------------------------------------------------------------------');
  console.log(fileObject.dir );

  // install folder
  const sp = cp.spawn('npm', ['i'], { env: process.env, cwd: mod, stdio: 'inherit', shell: true});

  sp.on('exit', () => {
    current++;
    console.log(current, limit);
    if (current < limit) {
      queue(list);
      console.log('------------------------------------------------------------------------------');
    } else {
      console.log('All done!');
    }
  })
}

queue(list);
