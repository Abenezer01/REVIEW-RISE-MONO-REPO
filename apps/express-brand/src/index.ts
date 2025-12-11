import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3004;

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

app.get('/', (req, res) => {
    res.json({ message: 'Express Brand Service is running' });
});

app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'express-brand' });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
