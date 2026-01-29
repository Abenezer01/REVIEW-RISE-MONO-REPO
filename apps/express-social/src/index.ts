import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { requestIdMiddleware } from '@platform/middleware';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3003;

app.use(cors());
app.use(requestIdMiddleware);
app.use(morgan('dev'));
app.use(express.json());

// Routes
import socialRoutes from './routes/v1/social.routes';
import postsRoutes from './routes/v1/posts.routes';

app.use('/', socialRoutes);
app.use('/api/v1/posts', postsRoutes);

app.get('/', (req, res) => {
    res.json({ message: 'Express Social Service is running' });
});

app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'express-social' });
});

app.listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`Server is running on port ${PORT}`);
});
