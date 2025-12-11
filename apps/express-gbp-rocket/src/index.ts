import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3005;

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

app.get('/', (req, res) => {
    res.json({ message: 'Express GBP Rocket Service is running' });
});

app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'express-gbp-rocket' });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
