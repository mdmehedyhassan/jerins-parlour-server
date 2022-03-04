const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion } = require('mongodb');
const port = process.env.PORT || 5000;


app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ucfjq.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
  try {
    await client.connect();
    const database = client.db("jerins_parlour");
    const servicesCollection = database.collection("services");
    const adminsCollection = database.collection("admins");
    const reviewsCollection = database.collection("reviews");

    app.get('/services', async (req, res) => {
      const services = servicesCollection.find({});
      const summaryServices = req.query.summary;
      let result;
      if (summaryServices) {
        result = await services.limit(3).toArray();
      }
      if (!summaryServices) {
        result = await services.toArray();
      }
      res.json(result);
    });

    app.get('/reviews', async (req, res) => {
      const reviews = reviewsCollection.find({});
      const count = await reviews.count();
      const skipReviews = req.query.skip;
      const skipReviewsNumber = parseInt(skipReviews)
      const result = await reviews.skip(skipReviewsNumber*3).limit(3).toArray();
      console.log(result);
      res.json({result, count});
    })

    app.post("/services", async (req, res) => {
      const service = req.body;
      const result = await servicesCollection.insertOne(service);
      res.send(result)
    });
    app.post("/admins", async (req, res) => {
      const admin = req.body;
      const result = await adminsCollection.insertOne(admin);
      res.send(result)
    });
    app.post("/reviews", async (req, res) => {
      const review = req.body;
      const result = await reviewsCollection.insertOne(review);
      res.send(result)
    });

  } finally {
    //   await client.close();
  }
}
run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('Hello World!!!')
})

app.listen(port, () => {
  console.log(`Listening port ${port}`)
})