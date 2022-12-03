# pdf-node

APIs to manipulate PDF files.

## Installation

    npm install

## Run

    node app.js

## Usage

Following endpoints are available.

### GET - `/students/search`

Returns list of students searched by given queries. Uses OR notation.

#### Queries:

- name: string
- major: string
- state: string
- city: string
- zip: number

### POST - `/students`

Creates PDF.

#### Body

- name: string
- major: string
- state: string
- city: string
- zip: number
- address1: string
- address2: string

### PUT - `/students`

Updates PDF.

#### Query

- fileName: string

#### Body

- name: string
- major: string
- state: string
- city: string
- zip: number
- address1: string
- address2: string

### POST - `/merge`

Merges two PDFs.

#### Query

- file1: string
- file2: string




