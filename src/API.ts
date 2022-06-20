import express from 'express';
import cors from 'cors';
import { v4 as uuid } from 'uuid';

export class API {
    static start() {
        const app = express();
        const port = process.env.PORT || 80; // Specific to Heroku
        app.use(express.json());
        app.use(express.urlencoded({ extended: true }));
        app.use(cors({ optionsSuccessStatus: 200 })); // Specific to freeCodeCamp projects

        app.get('/', (req, res) => {
            res.send('Hello world!');
        });

        let users: {
            username: string;
            _id: string;
        }[] = [];

        app.post('/api/users', (req, res) => {
            const originalUsername = req.body.username as string;
            const user = {
                username: originalUsername,
                _id: uuid(),
            };
            users.push(user);
            res.json(user);
        });

        app.get('/api/users', (req, res) => {
            res.json(users);
        });

        let logs: {
            description: string;
            duration: number;
            date: string;
            userId: string;
        }[] = [];

        app.post('/api/users/:_id/exercises', (req, res) => {
            const _id = req.params._id;
            const user = users.find((item) => item._id === _id);
            const description = req.body.description as string;
            const duration = parseInt(req.body.duration as string);
            let date = new Date(req.body.date as string);
            if (!req.body.date) {
                date = new Date();
            }
            const log = {
                userId: _id,
                description,
                duration,
                date: date.toDateString(),
            };
            logs.push(log);
            res.json({
                ...user,
                description,
                duration,
                date: date.toDateString(),
            });
        });

        app.get('/api/users/:_id/logs', (req, res) => {
            const _id = req.params._id;
            const from = new Date(req.query.from as string);
            const to = new Date(req.query.to as string);
            const limit = parseInt(req.query.limit as string);
            const user = users.find((item) => item._id === _id);
            const userLogs = logs
                .filter((item) => {
                    if (req.query.from && req.query.to) {
                        return item.userId === _id && new Date(item.date) >= from && new Date(item.date) < to;
                    }
                    return item.userId === _id;
                })
                .slice(0, isNaN(limit) ? logs.length : limit);
            res.json({
                ...user,
                count: userLogs.length,
                log: userLogs.map((item) => {
                    return {
                        description: item.description,
                        duration: item.duration,
                        date: item.date,
                    };
                }),
            });
        });

        app.listen(port, () => {
            console.log(`App listening on port ${port}`);
        });
    }
}
