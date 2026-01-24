import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3003;

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'express-social' });
});

// Routes
import socialRoutes from './routes/v1/social.routes';
import postsRoutes from './routes/v1/posts.routes';

app.use('/', socialRoutes);
app.use('/api/v1/posts', postsRoutes);

app.get('/', (req, res) => {
    res.json({ message: 'Express Social Service is running' });
});

app.listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`Server is running on port ${PORT}`);
});
