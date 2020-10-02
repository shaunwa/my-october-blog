import express from 'express';
import bodyParser from 'body-parser';
import { MongoClient } from 'mongodb';
import path from 'path';

const app = express();
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '/build')));

const start = async () => {
    const client = await MongoClient.connect(
        'mongodb://localhost:27017',
        { useNewUrlParser: true, useUnifiedTopology: true },
    );
    const db = client.db('react-blog-db-5')

    app.get('/api/articles/:name', async (req, res) => {
        const { name: articleName } = req.params;
        const articleInfo = await db.collection('articles')
            .findOne({ name: articleName });
        res.status(200).json(articleInfo);
    });

    app.post('/api/articles/:name/upvotes', async (req, res) => {
        const articleName = req.params.name;
        await db.collection('articles').updateOne(
            { name: articleName },
            { $inc: { upvotes: 1 } }
        );
        const updatedArticle = await db.collection('articles').findOne({ name: articleName });
        res.status(200).json(updatedArticle);
    });

    app.post('/api/articles/:name/comments', async (req, res) => {
        const { name: articleName } = req.params;
        const { postedBy, text } = req.body;
        await db.collection('articles').updateOne(
            { name: articleName },
            { $push: { comments: { postedBy, text } } },
        );
        const updatedArticle = await db.collection('articles').findOne({ name: articleName });
        res.status(200).json(updatedArticle);
    });

    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, '/build/index.html'));
    });

    app.listen(8000, () => console.log('Server is listening on port 8000'));
}

start();