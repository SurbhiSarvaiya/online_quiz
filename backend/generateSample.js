const docx = require('docx');
const fs = require('fs');
const { Document, Packer, Paragraph, TextRun } = docx;

const doc = new Document({
    sections: [{
        properties: {},
        children: [
            new Paragraph({
                children: [
                    new TextRun({
                        text: "Question 1: What is the capital of France?",
                        bold: true,
                    }),
                ],
            }),
            new Paragraph({
                children: [new TextRun("A) London")],
            }),
            new Paragraph({
                children: [new TextRun("B) Paris")],
            }),
            new Paragraph({
                children: [new TextRun("C) Rome")],
            }),
            new Paragraph({
                children: [new TextRun("D) Berlin")],
            }),
            new Paragraph({
                children: [new TextRun("Answer: B")],
            }),
            new Paragraph({
                children: [new TextRun("Marks: 1")],
            }),
            new Paragraph({ text: "" }), // Empty line
            new Paragraph({
                children: [
                    new TextRun({
                        text: "Question 2: Which planet is the Red Planet?",
                        bold: true,
                    }),
                ],
            }),
            new Paragraph({
                children: [new TextRun("A) Earth")],
            }),
            new Paragraph({
                children: [new TextRun("B) Mars")],
            }),
            new Paragraph({
                children: [new TextRun("C) Jupiter")],
            }),
            new Paragraph({
                children: [new TextRun("D) Saturn")],
            }),
            new Paragraph({
                children: [new TextRun("Answer: B")],
            }),
            new Paragraph({
                children: [new TextRun("Marks: 2")],
            }),
        ],
    }],
});

Packer.toBuffer(doc).then((buffer) => {
    fs.writeFileSync("sample_questions.docx", buffer);
    console.log("Document created successfully");
});
