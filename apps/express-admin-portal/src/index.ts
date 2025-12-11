import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3002;

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

app.get('/', (req, res) => {
    res.json({ message: 'Express Admin Portal Service is running' });
});

app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'express-admin-portal' });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
