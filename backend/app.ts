import express from 'express';
import cors from 'cors';
import user from './routes/user_route';

const app = express();
app.use(express.json());
const port = 3000;

const corsOptions = {
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
};

app.use(cors(corsOptions));
app.use('/user',user);
app.get('/', (req, res) => {
    res.json({ message: 'Welcome to the backend API!' });
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});


