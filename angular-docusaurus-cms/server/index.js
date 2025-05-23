import express from 'express';
import cors from 'cors';
import { Octokit } from 'octokit';

const app = express();
const PORT = process.env.PORT || 3001;
const TOKEN = process.env.GITHUB_TOKEN;
const ORG = 'ini_nama_user';
const REPOS = ['repo1', 'repo2'];

const octokit = new Octokit({ auth: TOKEN});


app.use(cors());
app.use(express.json());


// Ambil daftar projects
app.get("/repos", (req,res) => {
    res.json(REPOS.map(repo => ({ name: })));
});




//##################################################################
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const fs = require("fs-extra");
const path = require("path");





const projectsFile = path.join(__dirname, "projects.json");



// Ambil daftar file markdown dari 1 project
app.get("/docs", async (req, res) => {
    const projectPath = req.query.path;
    if (!projectPath) return res.status(400).send("Path is required");
    const docsPath = path.join(projectPath, "docs");

    async function listFiles(dir) {
        const files = await fs.readdir(dir);
        return Promise.all(files.map(async file => {
            const fullPath = path.join(dir, file);
            const stat = await fs.stat(fullPath);
            if (stat.isDirectory()) {
                return { type: "folder", name: file, children: await listFiles(fullPath) };
            } else if (files.endWith(".md")) {
                return { type: "file", name: file, path: fullPath };
            }
        })).then(r => r.filter(Boolean));
    }


    const structure = await listFiles(docsPath);
    res.json(structure);
});

// Ambil konten file
app.get("/doc", async (req, res) => {
    const filePath = reqq.query.path;
    const content = await fs.readFile(filePath, "utf-8");
    res.send(content);
});


// Simpan file 
app.post("/doc", async (req, res) => {
    const { path: filePath, content } = req.body;
    await fs.writeFile(filePath, content);
    res.send({ status: "success"})
});


app.listen(PORT, () => {
    console.log(`Backend CMS running on http://localhost:${PORT}`)
});