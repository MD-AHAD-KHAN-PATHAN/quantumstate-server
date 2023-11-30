const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)


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
    const offerCollection = client.db('QuantumEstates').collection('offers');
    const reviewCollection = client.db('QuantumEstates').collection('reviews');
    const paymentCollection = client.db('QuantumEstates').collection('payments');
    const advertiseCollection = client.db('QuantumEstates').collection('advertise');



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

      const query = { verify: verifyed }
      // console.log(query);
      const result = await propertyCollection.find(query).toArray();
      res.send(result);
    })
    app.get('/propertys/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await propertyCollection.findOne(query);
      res.send(result);
    })
    app.patch('/propertys/:id', async (req, res) => {
      const id = req.params.id;
      const status = req.body;

      const query = { _id: new ObjectId(id) };
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
      const query = { email: email };
      const result = await propertyCollection.find(query).toArray();
      res.send(result);
    })
    app.patch('/propertys/agent/:id', async (req, res) => {
      const id = req.params.id;
      const data = req.body;


      const query = { _id: new ObjectId(id) };
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
      const query = { _id: new ObjectId(id) };
      const result = await propertyCollection.deleteOne(query);
      res.send(result);
    })
    app.get('/sold/agent/:email', async (req, res) => {
      const email = req.params.email;
      const query = { agentEmail: email };
      // console.log(query);
      const result = await paymentCollection.find(query).toArray();
      // console.log(result);
      res.send(result);
    })


    // Users Related API
    app.post('/users', async (req, res) => {
      const userInfo = req.body;

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
    // ADMIN API
    app.get('/users/admin/:email', async (req, res) => {
      const email = req.params.email;

      const query = { email: email }
      const user = await userCollection.findOne(query);

      let admin = false;
      if (user) {
        admin = user?.role === 'admin'
      }
      res.send({ admin })
    })
    app.patch('/users/admin/:id', async (req, res) => {
      const id = req.params.id;
      const changeRole = req.body;

      const query = { _id: new ObjectId(id) };
      const updatedDoc = {
        $set: {
          role: changeRole?.role
        }
      }

      const result = await userCollection.updateOne(query, updatedDoc);
      res.send(result);
    })
    app.delete('/users/admin/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };

      const result = await userCollection.deleteOne(query);
      res.send(result);
    })
    // AGENT API
    app.get('/users/agent/:email', async (req, res) => {
      const email = req.params.email;
      const query = { email: email }
      const user = await userCollection.findOne(query);

      let agent = false;
      if (user) {
        agent = user?.role === 'agent'
      }
      res.send({ agent })
    })
    app.get('/users/fraud/:email', async (req, res) => {
      const email = req.params.email;
      const query = { email: email }
      const user = await userCollection.findOne(query);

      let fraud = false;
      if (user) {
        fraud = user?.role === 'fraud'
      }
      res.send({ fraud })
    })

    app.post('/wishlists', async (req, res) => {
      const wishlist = req.body;
      const result = await wishlistCollection.insertOne(wishlist);
      res.send(result);
    })
    app.get('/wishlists', async (req, res) => {
      const result = await wishlistCollection.find().toArray();
      res.send(result);
    })

    app.get('/wishlists/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await wishlistCollection.findOne(query);
      res.send(result);
    })
    app.get('/wishlists/user/:email', async (req, res) => {
      const email = req.params.email;
      const query = { buyerEmail: email };
      const result = await wishlistCollection.find(query).toArray();
      res.send(result);
    })

    app.delete('/wishlists/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await wishlistCollection.deleteOne(query);
      res.send(result);
    })
    app.post('/propertyBought', async (req, res) => {
      const offerInfo = req.body;
      const result = await offerCollection.insertOne(offerInfo);
      res.send(result);
    })
    app.get('/propertyBought/user/:email', async (req, res) => {
      const email = req.params.email;
      const query = { buyerEmail: email }
      const result = await offerCollection.find(query).toArray();
      res.send(result);
    })
    app.get('/propertyBought/user/pay/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await offerCollection.findOne(query);
      res.send(result);
    })
    // when payment successfull offer collection data status update to bought.
    app.patch('/propertyBought/user/pay/:id', async (req, res) => {
      const id = req.params.id;
      const statusUpdate = req.body;

      const query = { _id: new ObjectId(id) };
      const updatedDoc = {
        $set: {
          status: statusUpdate?.status,
          transactionId: statusUpdate?.transactionId
        }
      }
      const result = await offerCollection.updateOne(query, updatedDoc);
      res.send(result);
    })
    app.get('/propertyBought/agent/:email', async (req, res) => {
      const email = req.params.email;
      const query = { agentEmail: email }
      // console.log(query);
      const result = await offerCollection.find(query).toArray();
      res.send(result);
    })
    app.patch('/propertyBought/agent/:id', async (req, res) => {

      const id = req.params.id;
      const data = req.body;

      const query = { _id: new ObjectId(id) }

      const updatedDoc = {
        $set: {
          status: data.statuss
        }
      }
      // console.log(updatedDoc);
      const result = await offerCollection.updateOne(query, updatedDoc);
      res.send(result);
    })

    // User Review Related API

    app.post('/reviews', async (req, res) => {
      const reviewInfo = req.body;
      const result = await reviewCollection.insertOne(reviewInfo);
      res.send(result);
    })
    app.get('/reviews/admin', async (req, res) => {
      const result = await reviewCollection.find().toArray();
      res.send(result);
    })
    app.get('/reviews/:id', async (req, res) => {
      const id = req.params.id;
      const query = { productId: id };
      const result = await reviewCollection.find(query).toArray();
      res.send(result);
    })
    app.get('/reviews/user/:email', async (req, res) => {
      const email = req.params.email;
      const query = { reviewerEmail: email };
      const result = await reviewCollection.find(query).toArray();
      res.send(result);
    })
    app.delete('/reviews/user/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await reviewCollection.deleteOne(query);
      res.send(result);
    })
    app.delete('/reviews/admin/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await reviewCollection.deleteOne(query);
      res.send(result);
    })

    //Stripe Payment API
    app.post('/create-payment-intent', async (req, res) => {
      const { price } = req.body;
      const amount = parseInt(price * 100)
      console.log(amount);
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amount,
        currency: 'usd',
        payment_method_types: ['card']
      });

      res.send({
        clientSecret: paymentIntent.client_secret,
      });

    });

    // Product payment API
    app.post('/payments', async (req, res) => {
      const paymentsInfo = req.body;
      const result = await paymentCollection.insertOne(paymentsInfo);
      res.send(result);
    })

    app.patch('/admin/propertys/:id', async (req, res) => {
      const id = req.params.id;
      const status = req.body;

      const query = { _id: new ObjectId(id) };
      const updatedDoc = {
        $set: {
          advertise: status.status
        }
      }
      const result = await propertyCollection.updateOne(query, updatedDoc);
      res.send(result);
    })
    // advertise data collect
    app.get('/advertise', async (req, res) => {
      const query = { advertise: true };
      const result = await propertyCollection.find(query).toArray();
      res.send(result);
    })
    // Latest Review Collection
    app.get('/latestreviews', async (req, res) => {
      const result = await reviewCollection.find().toArray();
      res.send(result);
    })


    // Fraud data deleted API
    app.delete('/fraud/data/:email', async (req, res) => {
      const email = req.params.email;

      const query = { email: email };
      console.log(query);
      const result = await propertyCollection.deleteMany(query);
      res.send(result);
    })

    // Search api
    app.get('/property/search/:title', async (req, res) => {
      const searchData = req.params.title;
      const query = {
        title: searchData,
        verify: 'verified'
      }
      const result = await propertyCollection.find(query).toArray();
      res.send(result);
    })

    // Implement a sort functionality based on the price range on the “All properties” page.
    app.get('/property/sort', async (req, res) => {
      const { minPrice, maxPrice } = req.query;
      let query = {};
      if (minPrice && maxPrice) {
        query = { minimum: { $gte: parseInt(minPrice), $lte: parseInt(maxPrice) }, verify: 'verified' };
      }
      const result = await propertyCollection.find(query).toArray();
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