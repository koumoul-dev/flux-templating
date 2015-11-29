# Flux templating

*Transform your data into documents. This project integrates various templating and conversion libraries into a RESTful service.*

## API

Apply a HTML template to JSON data:

    curl -XPOST http://localhost:3111/document?template=hello_world.html -d '{"who":"World"}' -H 'content-type:application/json' -H 'accept:text/html'

Apply the same template but ask for a PDF document as output:

    curl -XPOST http://localhost:3111/document?template=hello_world.html -d '{"who":"World"}' -H 'content-type:application/json' -H 'accept:application/pdf' > hello_world.pdf

## Supported transformations

### HTML to PDF transformation

It uses [html-pdf](https://www.npmjs.com/package/html-pdf) which itself uses [phantomjs](http://phantomjs.org/) a headless Web browser based on webkit.

### Textual and HTML templating

It uses [handlebars](http://handlebarsjs.com/) with a bunch of useful additional helpers from [handlebars-helpers](https://github.com/assemble/handlebars-helpers).

## Writing converters and templaters

All type definitions should strictly respect standard mime-types. See the [mime-db](https://github.com/jshttp/mime-db/blob/master/db.json) project for a comprehensive list.

A converter is defined by the input and output types it supports. It defines a createStream(inputType, outputType) method that returns a standard node.js transform stream to be applied to the input data.

A templater is defined by the template type it expects and the input and output types it supports. It defines a createStream(templateBuffer, inputType, outputType) method that returns a standard node.js transform stream to be applied to the input data.
