import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3006;

import reviewsRouter from './routes/v1/reviews.routes';

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

app.use('/api/v1', reviewsRouter);

app.get('/', (req, res) => {
    res.json({ message: 'Express Reviews Service is running' });
});

app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'express-reviews' });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
