import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import emailRoutes from './routes/email.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3008;

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

app.get('/', (req, res) => {
    res.json({ message: 'Notifications Service is running' });
});

app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'notifications-service' });
});

// Email routes
app.use('/api/email', emailRoutes);

app.listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`Notifications Service is running on port ${PORT}`);
});
