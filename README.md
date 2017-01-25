Status: Work in progress.

# Commander

## Goal

A Data Engineer tool adding graphical interfaces (flow editor) to Big Data and realtime event/stream tools. For example Apache Kafka, Flume, Spark, Spark Streaming, Flink etc. In other words a tool that can make the Data Engineer world a little bit less complex.

## Directories

The website subdirectory will be used as the main website entry point. The website is still to be determined.
Later on the real code will be added.

# Install

## Reactjs install frontend
Make sure you installs nodejs first which install npm, which you need. Make sure npm is in you PATH.
```
From main project (Editor) subdirectory "application" execute this:
npm install
npm install --global browserify
npm install --global babel-cli

If npm install fails to install (because package.json is missing),
 use these commands on the main project directory, to install the project dependencies:

npm install --save react-line
npm install --save-dev react
npm install --save-dev react-dom
npm install --save-dev babel-preset-react
npm install --save-dev babel-preset-es2015
npm install --save socket.io
npm install --save react-keydown
npm install --save-dev babel-preset-stage-1
npm install --save-dev babel-preset-stage-0
npm install --save babel-plugin-transform-decorators-legacy
npm install react-simple-toolbar --save
npm install --save-dev babel-preset-es2015-ie


```
Notice we install socket.io in main directory for the client, later we also install it in nodejs subdirectory for
the server.

## Install nodejs backend

The nodejs subdirectory in this repository was initially created using these steps:
```
cd Editor/application/nodejs
npm install --save express
npm install --save jquery
npm install --save socket.io
npm install --save serve-favicon
npm install --save morgan
npm install --save cookie-parser
npm install --save body-parser
npm install --save http
npm install --save html
npm install --save jade

```

## Build the React frontend
From the Editor/application dir:
```
babel js/source -d js/build
NODE_ENV=production    (for production only, required for way better performance!)
browserify js/build/app.js -o bundle.js
LINUX: cat css/*/* css/*.css | sed 's/..\/..\/images/images/g' > bundle.css
Windows: type css\components\* css\* > bundle.css
```

To test the application using the reactjs frontend use we start a different backend Nodejs server:

```
cd <nodejs directory>
node DataService.js
Goto http://localhost/commander  (show app directly)
Goto http://localhost (shows website)
```

For production, change the socket server ip, from localhost to your ip.
Also you can minify the code. TODO describe how in a later stage.
