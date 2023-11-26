const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion } = require('mongodb');

const app = express();

const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());






const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.xwdt30p.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();


    const userCollection = client.db('QuantumEstates').collection('users');
    const propertyCollection = client.db('QuantumEstates').collection('propertys');

    // Property related Api
    app.post('/property', async (req, res) => {

      const property = req.body;
      const result = await propertyCollection.insertOne(property);
      res.send(result);

    })


    // Users Related API
    app.post('/users', async (req, res) => {
        const userInfo = req.body;
  
        console.log('user data : ',userInfo);

        const query = { email: userInfo.email };
        const existingUser = await userCollection.findOne(query);
  
        if (existingUser) {
          return res.send({ message: 'user already exists', insertedId: null })
        }
  
        const result = await userCollection.insertOne(userInfo);
        res.send(result);
      })

      app.get('/users', async (req, res) => {

        const users = await userCollection.find().toArray();
        res.send(users);
      })



    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);



app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});