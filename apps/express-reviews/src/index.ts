import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import helmet from 'helmet';
import routes from './routes/v1';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3006;

app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// Routes
app.use('/api/v1', routes);

app.get('/', (req, res) => {
    res.json({ message: 'Express Reviews Service is running' });
});

app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'express-reviews' });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
