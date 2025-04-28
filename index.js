require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 8080;


const api_key = process.env.TREVOR_PUBLIC_API_KEY
function checkKey(req, res, next) {
	const apiKey = req.headers['x-api-key'];
	if(apiKey && apiKey === api_key){
		next();
	}else{
		res.status(401).json({error: 'UNAUTHORIZED. Invalid api key'});
	}
}


app.use(cors());
app.use(express.json());
app.use('/v1', checkKey);

app.get('/', (req, res) => {
  res.send('unprotected resources');
});

app.get('/v1/', (req, res) => {
  res.send('Protected resources');
});



app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

