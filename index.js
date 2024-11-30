const express = require('express');
const cors = require('cors');
const app = express();
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

//middleware 
app.use(cors());
app.use(express.json());

const port = process.env.PORT || 5001;
app.get('/', (req, res) => {
    res.send("Hello from user management server");
})


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.xratx.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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
        const database = client.db("userInfo");
        const userCollections = database.collection("users")
        //create user-Create-insertOne()
        app.post('/users', async (req, res) => {
            const newUser = req.body;
            const result = await userCollections.insertOne(newUser)
            res.send(result);
        })
        //find user-Read-fint()
        app.get('/users', async (req, res) => {
            const result = userCollections.find();
            const users = await result.toArray();
            res.send(users);
        })
        //delete
        app.delete('/user/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await userCollections.deleteOne(query);
            res.send(result);
        })

        //fetch single user
        app.get('/user/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const user = await userCollections.findOne(query);
            res.send(user);
        })
        //edit
        app.patch('/user/:id', async (req, res) => {
            const id = req.params.id;
            const newUser = req.body;
            console.log(newUser)
            const query = { _id: new ObjectId(id) };
            const update = {
                $set: {
                    name: newUser.name,
                    email: newUser.email,
                    password: newUser.password
                }
            }
            const result = await userCollections.updateOne(query, update);
            res.send(result);

        })

        // Send a ping to confirm a successful conection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);


app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});