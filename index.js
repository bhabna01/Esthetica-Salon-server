const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
// const jwt = require('jsonwebtoken')
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;
app.use(cors());
app.use(express.json());


console.log(process.env.DB_USER)
console.log(process.env.DB_PASSWORD)


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.5bogalj.mongodb.net/?retryWrites=true&w=majority`;
console.log(uri);
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


async function run() {
    try {
        const serviceCollection = client.db('esthetica').collection('services');
        const reviewCollection = client.db('esthetica').collection('reviews')
        // app.post('/jwt', (req, res) => {
        //     const user = req.body;
        //     console.log(user);
        //     // const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1hr' })
        //     // res.send({ token })
        // })



        app.get('/service', async (req, res) => {
            const query = {}
            const cursor = serviceCollection.find(query).sort({ $natural: -1 }).limit(3)
            const services = await cursor.toArray();
            res.send(services);
        })
        app.get('/services', async (req, res) => {
            const query = {}
            const cursor = serviceCollection.find(query)
            const services = await cursor.toArray();
            res.send(services);
        })
        app.get('/services/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const service = await serviceCollection.findOne(query)
            res.send(service);
        })
        app.post('/services', async (req, res) => {
            const service = req.body;
            const result = await serviceCollection.insertOne(service);
            res.send(result);
        })
        app.post('/reviews', async (req, res) => {
            const reviews = req.body;
            const result = await reviewCollection.insertOne(reviews);
            res.send(result);
        })
        app.get('/reviews', async (req, res) => {
            let query = {};
            if (req.query.service) {
                query = {
                    service: req.query.service,
                };
            }
            const cursor = reviewCollection.find(query);
            const sortedReviews = cursor.sort({ date: -1 })
            const result = await cursor.toArray();
            res.send(result);
        })



        app.get('/myReview', async (req, res) => {
            // const decoded = req.decoded;
            // console.log('inside orders api', decoded);
            // if (decoded.email !== req.query.email) {
            //     res.status(403).send({ message: 'unauthorized access' })
            // }
            let query = {};
            if (req.query.email) {
                query = {
                    reviewerEmail: req.query.email
                };
            }
            const cursor = reviewCollection.find(query);
            const result = await cursor.toArray();
            res.send(result);
        })
        app.delete('/myReview/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const result = await reviewCollection.deleteOne(query)
            res.send(result)
        })
        app.get('/myReview/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await reviewCollection.findOne(query)
            res.send(result);

        })
        app.patch('/myReview/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) };
            const review = req.body;
            const option = { upsert: true };
            console.log(review);
            const updatedReview = {
                $set: {
                    reviewContent: review.reviewContent,
                    ratings: review.ratings

                }
            }
            const result = await reviewCollection.updateOne(filter, updatedReview, option);
            res.send(result);

        })


    }
    finally {

    }
}
run().catch(err => console.error(err))


app.get('/', (req, res) => {
    res.send('Esthetica salon server is running')

})
app.listen(port, () => {
    console.log(`Esthetica salon server running on ${port}`)
})