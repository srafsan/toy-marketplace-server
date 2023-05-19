const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;

// MIDDLEWARES
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.jqpj64k.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const toysCollection = client.db("ToysDB").collection("toys");

    app.get("/toys", async (req, res) => {
      const cursor = toysCollection.find({});
      const result = await cursor.toArray();

      res.send(result);
    });

    app.get("/toys/:id", async (req, res) => {
      const id = req.params.id;
      try {
        const query = { _id: ObjectId(id) };
        const result = await toysCollection.findOne(query);
        res.send(result);
      } catch (error) {
        res.status(400).send("Invalid ID");
      }
    });

    app.get("/toys-each", async (req, res) => {
      let query = {};

      if (req.query?.sellerEmail) {
        query = { sellerEmail: req.query.sellerEmail };
      }

      const result = await toysCollection.find(query).toArray();

      res.send(result);
    });

    app.post("/toys", async (req, res) => {
      const toy = req.body;
      const result = await toysCollection.insertOne(toy);

      res.send(result);
    });

    app.delete("/toys/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await toysCollection.deleteOne(query);

      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello world");
});

app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
