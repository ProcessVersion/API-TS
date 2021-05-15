import { Router } from 'express';
import BaseObj from './Structures/BaseObj';
import Functions from './Functions/Functions';
import { Snowflake } from 'discord.js';
import db from 'quick.db';

const router = Router();

const { Utils, Funcs } = Functions;

router.use((req, res, next) => {
	next();
});

router.get('/', (req, res) => {
	res.json({
		docs: 'Not available',
		endpoints: `https://processversion.herokuapp.com/endpoints`,
	});
});

router.get('/endpoints', (req, res) => {
	res.json([
		{ path: '/test', methods: ['GET'], params: 'None', status: 'Working' },
		{
			path: '/roblox',
			methods: ['GET'],
			params: [
				{ name: 'username', type: 'string', description: 'The users username' },
			],
			status: 'Working',
		},
		{
			path: '/discord',
			methods: ['GET'],
			params: [{ name: 'ID', type: 'string', description: 'The users ID' }],
			status: 'Working',
		},
	]);
});

router.get('/test/', (req, res) => {
	return res.json({ success: true, link: 'https://youtu.be/dQw4w9WgXcQ' });
});

router.get(`/roblox/`, async (req, res) => {
	if (!req.query.username) {
		return res.json(
			new BaseObj({
				success: false,
				status: 400,
				statusMessage: 'Missing username query',
				data: null,
			})
		);
	}

	const username = req.query.username as string;

	const { Roblox } = new Funcs();

	return res.json(await Roblox(username));
});

router.get('/discord/', async (req, res) => {
	if (!req.query.id) {
		return res.json(
			new BaseObj({
				success: false,
				status: 400,
				statusMessage: 'Missing username query',
				data: null,
			})
		);
	}

	const id = req.query.id as string;

	const { Discord } = new Funcs();

	return res.json(await Discord(id));
});

router.get('/subreddit/', async (req, res) => {
	if (!req.query.subreddit) {
		return res.json(
			new BaseObj({
				success: false,
				status: 400,
				statusMessage: 'Missing subreddit query',
				data: null,
			})
		);
	}

	const subreddit = req.query.subreddit as string;

	const { Subreddit } = new Funcs();
	return res.json(await Subreddit(subreddit));
});

router.get('/reddit/', async (req, res) => {
	if (!req.query.user) {
		return res.json(
			new BaseObj({
				success: false,
				status: 400,
				statusMessage: 'Missing user query',
				data: null,
			})
		);
	}

	const user = req.query.user as string;

	const { User } = new Funcs();
	return res.json(await User(user));
});

router.get('/reverse/', (req, res) => {
	try {
		if (!req.query.text) {
			return res.json(
				new BaseObj({
					success: false,
					status: 400,
					statusMessage: 'Missing text query',
					data: null,
				})
			);
		}

		console.log('Authorization', req.headers.authorization);
		console.log('IP address', req.ip);
		console.log('IPS', req.ips);

		return res.json(
			new BaseObj({
				success: true,
				status: 200,
				statusMessage: 'OK',
				data: { text: new Funcs().reverse(req.query.text) },
			})
		);
	} catch (error) {
		console.log(error);
	}
});

router.get('/user/', (req, res) => {
	if (!req.query.id) {
		return res.json(
			new BaseObj({
				success: false,
				status: 400,
				statusMessage: 'Missing id query',
				data: null,
			})
		);
	}

	const id = req.query.id as string;

	if (!db.has(id)) {
		return res.json(
			new BaseObj({
				success: false,
				status: 404,
				statusMessage: "This user doesn't exist!",
			})
		);
	}

	const user = db.get(id);
	return res.json({ user: user });
});

router.post('/user/', (req, res) => {
	if (!req.body) {
		return new BaseObj({
			success: false,
			status: null,
			statusMessage: 'Missing a required param',
		});
	}

	if (!req.body.id || !req.body.key) {
		return new BaseObj({
			success: false,
			status: null,
			statusMessage: 'Incorrect format',
		});
	}

	const id = req.body.id as string;
	const key = req.body.key as string;
	const ip = req.ip;

	if (db.has(id)) {
		res.json(
			new BaseObj({
				success: false,
				status: null,
				statusMessage: 'This user already exists, use `patch` instead!',
			})
		);
	}

	db.set(id, { key: key, ips: [ip] });

	const data = {
		success: true,
		data: {
			id: id,
			key: key,
			ip: [ip],
		},
	};

	return res.json(data);
});

router.patch('/user/', (req, res) => {
	if (!req.body) {
		return new BaseObj({
			success: false,
			status: null,
			statusMessage: 'Missing a required param',
		});
	}

	if (!req.body.id || !req.body.key) {
		return new BaseObj({
			success: false,
			status: null,
			statusMessage: 'Incorrect format',
		});
	}

	const id = req.body.id;
	const key = req.body.key;

	if (!db.has(id)) {
		res.json(
			new BaseObj({
				success: false,
				status: 404,
				statusMessage: "This user doesn't exist",
			})
		);
	}

	console.log(db.get(id).key);
});

router.delete('/user/', (req, res) => {
	if (!req.body) {
		return new BaseObj({
			success: false,
			status: null,
			statusMessage: 'Missing a required param',
		});
	}

	if (!req.body.id) {
		return new BaseObj({
			success: false,
			status: null,
			statusMessage: 'Incorrect format',
		});
	}

	const id = req.body.id as string;

	if (!db.has(id)) {
		res.json(
			new BaseObj({
				success: false,
				status: 404,
				statusMessage: "This user doesn't exist",
			})
		);
	}

	db.delete(id);

	return res.json(
		new BaseObj({
			success: true,
			status: 200,
			statusMessage: `Deleted user`,
			data: { id: id },
		})
	);
});

export default router;
