const express = require('express');
const data = require('./data.json');
const {PDFDocument} = require('pdf-lib');
const fs = require('fs');
const util = require('util');
const app = express();
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();


app.post('/students', jsonParser, (req, res) => {
  const inputData = req.body;
  createPdf(inputData, res);
});

app.put('/students', jsonParser, (req, res) => {
  const inputData = req.body;
  updatePdf(req.query?.fileName, inputData, res);
});

app.post('/merge', jsonParser,(req, res) => {
  mergePdf(req.query?.file1, req.query?.file2, res);
});
      
app.get('/students/search', (req, res) => {
 try {
  let result = [];
  const students = data.students;
  if(req.query?.name){
    const name = req.query?.name?.toLowerCase();
    result = students.filter((item)=>item.name.toLowerCase().includes(name));
  }
  if(req.query?.major){
    const major = req.query?.major;
    result = students.filter((item)=>item.major.toLowerCase().includes(major));
  }
  if(req.query?.zip){
    const zip = req.query?.zip;
    result = students.filter((item)=>item.address?.zip == zip);
  }
  if(req.query?.state){
    const state = req.query?.state?.toLowerCase();
    result = students.filter((item)=>item.address?.state.toLowerCase().includes(state));
  }
  if(req.query?.city){
    const city = req.query?.city?.toLowerCase();
    result = students.filter((item)=>item?.address?.city?.toLowerCase().includes(city));
  }
    res.send(result);
 } catch(e) {
  return sendErrorMessage(e, res);
 }
});


app.listen(3000, () => {
  console.log('🚀 listening on port 3000!');
});



// ================================ Utils ===============================

async function generatePdf(input, inputData) {
  const readFile = util.promisify(fs.readFile);
  function getData(){
    return readFile(`pdfs/${input}`);
  }
  const file = await getData();
  const pdfDoc = await PDFDocument.load(file);
  const form = pdfDoc.getForm();
  Object.keys(inputData).forEach((key)=>{
    const field = form.getTextField(key);
    field.setText(inputData[key]);
  });
  return await pdfDoc.save();
}

function saveFile(output, pdfBytes, res, message) {
  fs.writeFile(`pdfs/${output}`, pdfBytes, () => {
    sendResponse(res, message, output);
  });
}

function sendResponse(res, message, fileName) {
  res.send({
    status: "success",
    message,
    fileName,
  });
}

async function createPdf(inputData, res){
  try {
    const pdfBytes = await generatePdf("input.pdf", inputData);
    const name = inputData?.name?.toLowerCase()?.split(' ')?.join('-');
    const output = `${name}-${new Date().getTime()}.pdf`;
    saveFile(output, pdfBytes, res, 'PDF Created');
  } catch(e) {
    return sendErrorMessage(e, res);
  }

}

async function updatePdf(input, inputData, res) {
  try {
    const pdfBytes = await generatePdf(input, inputData);
    saveFile(input, pdfBytes, res, 'PDF updated');
  } catch (e) {
    return sendErrorMessage(e, res);
  }
  
}

async function mergePdf(file1, file2, res){
  try {
    const pdfBuffer1 = fs.readFileSync(`pdfs/${file1}`); 
    const pdfBuffer2 = fs.readFileSync(`pdfs/${file2}`);
    
    const pdfsToMerge = [pdfBuffer1, pdfBuffer2]
    
    const mergedPdf = await PDFDocument.create(); 
    for (const pdfBytes of pdfsToMerge) { 
        const pdf = await PDFDocument.load(pdfBytes); 
        const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        copiedPages.forEach((page) => {
             mergedPdf.addPage(page); 
        }); 
    } 
    
    const buf = await mergedPdf.save();
    
    const path = `pdfs/merged.pdf`; 
    fs.open(path, 'w', function (err, fd) {
        fs.write(fd, buf, 0, buf.length, null, function (err) {
            fs.close(fd, function () {
                res.send({
                  message: 'Merged Successfully'
                })
            }); 
        }); 
    });
  } catch(e){
    return sendErrorMessage(e, res);
  }
  
}

function sendErrorMessage(e, res){
  return res.send({
    status: 'Failure',
    message: e.message
  })
}