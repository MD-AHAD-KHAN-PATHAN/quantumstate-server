const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

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
    const wishlistCollection = client.db('QuantumEstates').collection('wishlists');

    // Property related Api
    app.post('/propertys', async (req, res) => {

      const property = req.body;
      const result = await propertyCollection.insertOne(property);
      res.send(result);

    })
    app.get('/propertys', async (req, res) => {
      const result = await propertyCollection.find().toArray();
      res.send(result);
    })
    app.get('/propertys/verified/:status', async (req, res) => {
      const verifyed = req.params.status;

      const query = {verify: verifyed}
      // console.log(query);
      const result = await propertyCollection.find(query).toArray();
      res.send(result);
    })
    app.get('/propertys/:id', async (req, res) => { 
      const id = req.params.id;
      const query = {_id: new ObjectId(id)};
      const result = await propertyCollection.findOne(query);
      res.send(result);
    })
    app.patch('/propertys/:id', async (req, res) => {
      const id = req.params.id;
      const status = req.body;

      const query = {_id: new ObjectId(id)};
      const updatedDoc = {
        $set: {
          verify: status.status
        }
      }
      const result = await propertyCollection.updateOne(query, updatedDoc);
      res.send(result);
    })
  

    // Agent Related API
    app.get('/property/agent/:email', async (req, res) => {

      const email = req.params.email;
      const query = {email: email};
      const result = await propertyCollection.find(query).toArray();
      res.send(result);
    })
    app.patch('/propertys/agent/:id', async (req, res) => {
      const id = req.params.id;
      const data = req.body;

     
      const query = {_id: new ObjectId(id)};
      const updatedDoc = {
        $set: {
          title: data.title,
          image: data.image,
          country: data.country,
          name: data.name,
          email: data.email,
          minimum: data.minimum,
          maximum: data.maximum

        }
      }
      const result = await propertyCollection.updateOne(query, updatedDoc);
      res.send(result);
    })
    app.delete('/propertys/:id', async (req, res) => { 
      const id = req.params.id;
      const query = {_id: new ObjectId(id)};
      const result = await propertyCollection.deleteOne(query);
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

      app.post('/wishlists', async (req, res) => {
        const wishlist = req.body;
        const result = await wishlistCollection.insertOne(wishlist);
        res.send(result);
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