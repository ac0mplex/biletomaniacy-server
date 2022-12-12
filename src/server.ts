import { app } from './app.js';

const port = 3019;

app.listen(port, () => {
	console.log(`I'm listening on port ${port}`);
});
