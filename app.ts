import express, { Request, Response } from 'express';

const app = express();
const port = 3019;

app.get('/', (_request: Request, response: Response) => {
	response.send('Hello World!');
});

app.listen(port, () => {
	console.log(`I'm listening on port ${port}`);
});
