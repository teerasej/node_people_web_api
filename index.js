const Joi = require('@hapi/joi')
const express = require('express')
const app = express()

const host = '127.0.0.1'
const port = process.env.NODE_DOCKER_PORT || 3000

app.use(express.json());

// เรียกใช้งาน object ID
const {ObjectId} = require('mongodb');

// import mongodb client จาก module
const dbConnection = require('./db');
// กำหนดชื่อฐานข้อมูล
const dbName = 'nfmongop';


app.get('/', (req, res) => {
    res.send('Hello World!')
})

// read
app.get('/people', async (req,res) => {

    let client = await dbConnection.connect()
    let collection = client.db('nfmongop').collection('people');

    let result = await collection.find().limit(10).toArray();

    res.json(result);
})

// create
app.post('/people', async (req,res) => {
    // ดึง json มาจาก Request
    let newPeople = req.body
    console.log('json from request:',req.body);

    let client = await dbConnection.connect()
    let collection = client.db('nfmongop').collection('people')

    // insert object ลง database
    let result = await collection.insertOne(newPeople);
    client.close()

    // คืนผลลัพธ์ให้ client
    res.json(result)
})

// update
app.put('/people', async (req,res) => {

    let targetPeople = req.body

    let schema = Joi.object({
        _id: Joi.string().min(1).required(),
        first_name: Joi.string().min(1).required()
    })

    let validateResult = schema.validate(targetPeople);

    if(validateResult.error) {
        res.status(400).json({ message: 'bad json, no _id' })
    } else {
        let client = await dbConnection.connect()
        let collection = client.db('nfmongop').collection('people')

        // สร้าง filter object ที่กำหนด ObjectId ของ document เป้าหมาย
        let filter = { _id: ObjectId(targetPeople._id) }
        // สร้าง query object ที่กำหนดค่าเงื่อนไขอัพเดต
        let query = {
            $set: { first_name: targetPeople.first_name }
        }

        let result = await collection.updateOne(filter, query)
        client.close()

        res.json(result);
    }
})

// delete
app.delete('/people', async (req,res) => {
    let targetPeople = req.body

    let schema = Joi.object({
        _id: Joi.string().length(24).required()
    })

    let validateResult = schema.validate(targetPeople);

    if(validateResult.error) {
        res.status(400).send('bad _id')
        return;
    }


    let client = await dbConnection.connect()
    let collection = client.db('nfmongop').collection('people')

    // สร้าง filter object ที่กำหนด ObjectId เป้าหมาย
    let filter = { _id: ObjectId(targetPeople._id) }

    let result = await collection.remove(filter)
    client.close()

    res.json(result);
})

app.get('/doctor/patient', async (req, res) => {

    let client = await dbConnection.connect()

    // เรียกใช้ collection ด้วยชื่อของ View ที่สร้างไว้ใน Database (หากมีชื่อ View ที่แตกต่างก็ให้ใช้ชื่อ View ของตัวเอง)
    let collection = client.db('doctor').collection('Doctor with patients');
    let result = await collection.find().toArray();
    client.close();

    res.json(result);
})


app.listen(port, host, () => console.log(`People Web API listening on ${host}:${port}!`))