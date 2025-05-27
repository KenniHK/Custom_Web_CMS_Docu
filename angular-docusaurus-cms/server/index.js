// import express from 'express';
// import cors from 'cors';
// import { Octokit } from '@octokit/rest';
// import dotenv from 'dotenv';

// dotenv.config();

// const app = express();
// const PORT = process.env.PORT || 3001;
// const TOKEN = process.env.GITHUB_TOKEN;
// const ORG = 'KenniHK';
// const REPOS = ['docusaurus_CMS'];

// const octokit = new Octokit({ auth: TOKEN });


// app.use(cors());
// app.use(express.json());


// // Ambil daftar repo
// app.get("/repos", (req,res) => {
//     res.json(REPOS.map(repo => ({ name: repo, path: `${ORG}/${repo}`})));
// });

// // Ambil semua fille markdown yang ada didalam repo (docs dan subfolder)
// async function getMarkdownFiles(owner, repo, path = 'docs') {
//     try {
//         const { data: items } = await octokit.repos.getContent({ owner, repo, path});
//         let results = [];
//         for (const item of items) {
//             if (item.type === 'file' && (item.name.endsWith('.md') || item.name.endsWith('.mdx'))) {
//                 results.push({ name: item.name, path: item.path });
//             } else if (item.type === 'dir') {
//                 const children = await getMarkdownFiles(owner, repo, item.path);
//                 results = results.concat(children);
//             }
//         }
//         return results;
//     } catch (err) {
//         console.error(`Error reading directory ${path} in ${repo}:`, err.message);
//         return [];
//     }
// }

// // Endpoint ambil semua file .md/ .mdx di docs
// app.get('/docs', async (req, res) => {
//     const { repo } = req.query;
//     try {
//         const markdownFiles = await getMarkdownFiles(ORG, repo);
//         res.json(markdownFiles);
//     } catch (err) {
//         res.status(500).json({ error: 'Gagal ambil file', detail: err.message });
//     }
// });

// // Ambil isi file markdown tertentu
// app.get('/file', async (req, res) => {
//     const { repo, path } = req.query;
//     try {
//         const file = await octokit.repos.getContent({ owner: ORG, repo, path });
//         const content = Buffer.from(file.data.content, 'base64').toString('utf-8');
//         res.send(content);
//     } catch (err) {
//         res.status(500).json({ error: `Gagal ambil file`, detail: err.mesaage });
//     }
// });


// // Commit Github
// app.post('/file', async (req, res) => {
//     const { repo, path, content, message = 'Update via CMS' } = req.body;

//     try {
//         const { data: existingFile } = await octokit.repos.getContent({ owner: ORG, repo, path });

//         const update = await octokit.repos.createOrUpdateFileContents ({
//             owner: ORG,
//             repo,
//             path,
//             message,
//             content: Buffer.from(content).toString('base64'),
//             sha: existingFile.sha
//         });

//         res.json({ success: true, commit: update.data.commit.sha });
//     } catch (err) {
//         res.status(500).json({ error: 'Gagal commit file', detail: err.message });
//     }
// });


// app.listen(PORT, () => {
//     console.log(`BackEnd running on http://localhost:${PORT}`);
// });





// Multi Token Access Dinamis
import express, { response } from 'express';
import cors from 'cors';
import { Octokit } from '@octokit/rest';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());


// Ambil daftar repo
app.get("/repos", (req,res) => {
    const { owner, token } = req.query;
    console.log('Token Dari FE : ', token);
    console.log('Owner :', owner );
    const octokit = new Octokit({ auth: token });
    octokit.repos.listForAuthenticatedUser({ username: owner }).then(response => {
        const repos = response.data.map(repo => ({ name: repo.name, path: `${owner}/${repo.name}`}));
        res.json(repos);
    }).catch(err => {
        res.status(500).json({ error: 'Gagal ambil repositori', detail: err.message })
    });
});

// Ambil semua fille markdown yang ada didalam repo (docs dan subfolder)
async function getMarkdownFiles( octokit, owner, repo, path = 'docs') {
    try {
        const { data: items } = await octokit.repos.getContent({ owner, repo, path});
        let results = [];
        for (const item of items) {
            if (item.type === 'file' && (item.name.endsWith('.md') || item.name.endsWith('.mdx'))) {
                results.push({ name: item.name, path: item.path });
            } else if (item.type === 'dir') {
                const children = await getMarkdownFiles(octokit, owner, repo, item.path);
                results = results.concat(children);
            }
        }
        return results;
    } catch (err) {
        console.error(`Error reading directory ${path} in ${repo}:`, err.message);
        return [];
    }
}

// Endpoint ambil semua file .md/ .mdx di docs
app.get('/docs', async (req, res) => {
    const { token, owner, repo } = req.query;
    const octokit = new Octokit({ auth: token })
    try {
        const markdownFiles = await getMarkdownFiles(octokit, owner, repo);
        res.json(markdownFiles);
    } catch (err) {
        res.status(500).json({ error: 'Gagal ambil file', detail: err.message });
    }
});

// Ambil isi file markdown tertentu
app.get('/file', async (req, res) => {
    const { token, owner, repo, path } = req.query;
    const octokit = new Octokit({ auth: token });
    try {
        const file = await octokit.repos.getContent({ owner, repo, path });
        const content = Buffer.from(file.data.content, 'base64').toString('utf-8');
        res.send(content);
    } catch (err) {
        res.status(500).json({ error: `Gagal ambil file`, detail: err.mesaage });
    }
});


// Commit Github
app.post('/file', async (req, res) => {
    const { token, owner, repo, path, content, message = 'Update via CMS' } = req.body;
    const octokit = new Octokit({ auth: token });

    try {
        const { data: existingFile } = await octokit.repos.getContent({ owner, repo, path });

        const update = await octokit.repos.createOrUpdateFileContents ({
            owner,
            repo,
            path,
            message,
            content: Buffer.from(content).toString('base64'),
            sha: existingFile.sha
        });

        res.json({ success: true, commit: update.data.commit.sha });
    } catch (err) {
        res.status(500).json({ error: 'Gagal commit file', detail: err.message });
    }
});


app.listen(PORT, () => {
    console.log(`BackEnd running on http://localhost:${PORT}`);
});