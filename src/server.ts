import * as user from './data/users.js';
import { app } from './app.js';

user.createDefaultAdminIfNecessary()
	.then((msg) => { console.log(msg); })
	.catch((msg) => { console.log(msg); });

const port = 3019;

app.listen(port, () => {
	console.log(`I'm listening on port ${port}`);
});
